(() => {
  'use strict';

  const recorderShell = document.querySelector('[data-voice-recorder]');
  if (!recorderShell) return;
  const apiBase = recorderShell.dataset.voiceApiBase?.replace(/\/$/, '');
  const get = (selector) => recorderShell.querySelector(selector);
  const recordingStatuses = ['local', 'uploading', 'stored', 'failed'];
  const transcriptionStatuses = ['not_requested', 'awaiting_transcription', 'processing', 'complete', 'failed'];

  const prompts = [
    ['story', 'What story, message, wisdom, testimony, knowledge, or life lesson do you believe should outlive you?'],
    ['people', 'Who most needs to hear or receive this?'],
    ['experience', 'What did you live through, learn, build, survive, discover, or understand that shaped this message?'],
    ['signature_legacy', 'If you died tomorrow and could leave one book behind for your kids or the people you love, what would that book be about—and what from your life would you want to make sure they knew, understood, or remembered after you were gone?'],
    ['refuse_to_die', 'What would you refuse to let die with you?'],
    ['desired_impact', 'What do you hope someone understands, feels, changes, or does after hearing your story?'],
  ];

  const promptText = get('[data-prompt-text]');
  const promptCount = get('[data-prompt-count]');
  const step = get('[data-voice-step]');
  const state = get('[data-voice-state]');
  const elapsed = get('[data-elapsed]');
  const dot = get('[data-recording-dot]');
  const startButton = get('[data-record-start]');
  const stopButton = get('[data-record-stop]');
  const playButton = get('[data-record-play]');
  const againButton = get('[data-record-again]');
  const acceptButton = get('[data-record-accept]');
  const finishButton = get('[data-voice-finish]');
  const playback = get('[data-playback]');
  const help = get('[data-voice-help]');
  const status = get('[data-voice-status]');
  const submitPanel = get('[data-voice-submit]');
  const consents = get('[data-voice-consents]');
  const recordingConsent = get('[data-recording-consent]');
  const transcriptionConsent = get('[data-transcription-consent]');
  const leadForm = document.querySelector('[data-vtl-lead-form]');

  let promptIndex = 0;
  let mediaRecorder = null;
  let stream = null;
  let chunks = [];
  let currentBlob = null;
  let currentUrl = '';
  let timerId = null;
  let startedAt = 0;
  const clips = [];
  const uploadState = prompts.map(() => ({ recording_status: recordingStatuses[0], transcription_status: transcriptionStatuses[0] }));
  let session = null;

  const formatTime = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const acceptedCount = () => clips.filter(Boolean).length;
  const setStatus = (message, isError = false) => {
    status.hidden = false;
    status.textContent = message;
    status.dataset.state = isError ? 'error' : 'success';
  };
  const setButtons = ({ recording = false, hasClip = false } = {}) => {
    startButton.disabled = recording || hasClip;
    stopButton.disabled = !recording;
    playButton.disabled = !hasClip;
    againButton.disabled = !hasClip || recording;
    acceptButton.disabled = !hasClip || recording;
  };
  const clearCurrentClip = () => {
    if (currentUrl) URL.revokeObjectURL(currentUrl);
    currentUrl = '';
    currentBlob = null;
    playback.hidden = true;
    playback.removeAttribute('src');
    elapsed.textContent = '00:00';
    setButtons();
  };
  const stopTimer = () => {
    window.clearInterval(timerId);
    timerId = null;
    dot.classList.remove('recording');
  };
  const stopStream = () => {
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
  };
  const startTimer = () => {
    startedAt = Date.now();
    timerId = window.setInterval(() => {
      elapsed.textContent = formatTime(Math.floor((Date.now() - startedAt) / 1000));
    }, 250);
    dot.classList.add('recording');
  };
  const showPrompt = () => {
    promptCount.textContent = `Prompt ${promptIndex + 1} of ${prompts.length}`;
    promptText.textContent = prompts[promptIndex][1];
    step.textContent = promptIndex === 0 ? 'Ready when you are' : `${acceptedCount()} answer${acceptedCount() === 1 ? '' : 's'} accepted`;
    state.textContent = currentBlob ? 'Answer ready' : 'Not started';
    setButtons({ hasClip: Boolean(currentBlob) });
  };
  const request = async (path, options = {}) => {
    if (!apiBase) throw new Error('voice_backend_not_configured');
    const response = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(session?.token ? { 'x-vtl-session-token': session.token } : {}),
        ...(options.headers || {}),
      },
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok || result.ok === false) throw new Error(result.error || `HTTP ${response.status}`);
    return result;
  };
  const formPayload = () => {
    const data = new FormData(leadForm);
    return {
      full_name: String(data.get('full_name') || ''), email: String(data.get('email') || ''), phone: String(data.get('phone') || ''),
      city: String(data.get('city') || ''), state: String(data.get('state') || ''), best_contact_time: String(data.get('best_contact_time') || ''),
      preferred_contact_method: String(data.get('preferred_contact_method') || ''), consent_to_contact: data.get('consent_to_contact') === 'on',
      privacy_acknowledged: data.get('privacy_acknowledged') === 'on', recording_consent: recordingConsent.checked,
      transcription_consent: transcriptionConsent.checked, source_page: location.pathname,
    };
  };
  const initializeSession = async () => {
    const result = await request('/voice-discovery/session', { method: 'POST', body: JSON.stringify({ ...formPayload(), discovery_mode: 'voice_recording', prompt_version: 'vtl-marpc-002-v1' }) });
    session = { id: result.voice_discovery_session_id, referenceId: result.reference_id, token: result.session_token };
    if (!session.id) throw new Error('missing_session_id');
    if (!session.token) throw new Error('missing_session_token');
  };
  const uploadClip = async (index) => {
    const clip = clips[index];
    if (!clip || !session) throw new Error('missing_voice_session');
    const key = prompts[index][0];
    uploadState[index] = { recording_status: recordingStatuses[1], transcription_status: transcriptionStatuses[1] };
    setStatus(`Uploading answer ${index + 1} of ${prompts.length}...`);
    try {
      const authorization = await request('/voice-discovery/upload-authorize', { method: 'POST', body: JSON.stringify({ voice_discovery_session_id: session.id, prompt_key: key, prompt_version: 'vtl-marpc-002-v1', audio_mime_type: clip.mimeType, duration_seconds: clip.durationSeconds, recording_consent: recordingConsent.checked, transcription_consent: transcriptionConsent.checked }) });
      if (!authorization.signed_upload_url || !authorization.answer_id) throw new Error('invalid_upload_authorization');
      const uploadResponse = await fetch(authorization.signed_upload_url, { method: authorization.upload_method || 'PUT', headers: authorization.upload_headers || {}, body: clip.blob });
      if (!uploadResponse.ok) throw new Error(`upload_failed_${uploadResponse.status}`);
      const completed = await request('/voice-discovery/upload-complete', { method: 'POST', body: JSON.stringify({ voice_discovery_session_id: session.id, answer_id: authorization.answer_id, prompt_key: key, object_path: authorization.object_path, recording_status: 'stored', transcription_status: authorization.transcription_status || 'awaiting_transcription' }) });
      uploadState[index] = { recording_status: recordingStatuses.includes(completed.recording_status) ? completed.recording_status : recordingStatuses[2], transcription_status: transcriptionStatuses.includes(completed.transcription_status) ? completed.transcription_status : transcriptionStatuses[1], answer_id: authorization.answer_id, object_path: authorization.object_path };
    } catch (error) {
      uploadState[index] = { recording_status: recordingStatuses[3], transcription_status: transcriptionStatuses[0], error: error.message };
      throw error;
    }
  };
  const finishDiscovery = async () => {
    const voiceRequiredFields = ['full_name', 'email', 'phone', 'preferred_contact_method', 'consent_to_contact', 'privacy_acknowledged'];
    const invalidVoiceField = voiceRequiredFields.map((name) => leadForm.elements.namedItem(name)).find((field) => !field?.checkValidity());
    if (invalidVoiceField) { invalidVoiceField.reportValidity(); setStatus('Complete the required contact and privacy fields below before submitting your recorded discovery.', true); invalidVoiceField.focus(); return; }
    if (!recordingConsent.checked || !transcriptionConsent.checked) { setStatus('Both recording and transcription authorization are required.', true); return; }
    finishButton.disabled = true;
    try {
      if (!session) await initializeSession();
      if (acceptedCount() !== prompts.length) throw new Error('all_answers_required');
      for (let index = 0; index < clips.length; index += 1) if (clips[index] && uploadState[index].recording_status !== 'stored') await uploadClip(index);
      if (uploadState.some((item) => item.recording_status !== 'stored')) throw new Error('all_answers_must_be_stored');
      const completed = await request('/voice-discovery/session-complete', { method: 'POST', body: JSON.stringify({ voice_discovery_session_id: session.id, recording_consent: true, transcription_consent: true, answers: uploadState.filter((item) => item.answer_id).map(({ answer_id, object_path, recording_status, transcription_status }) => ({ answer_id, object_path, recording_status, transcription_status })) }) });
      const referenceId = completed.reference_id || session.referenceId;
      if (!referenceId) throw new Error('missing_reference_id');
      sessionStorage.setItem('vtl_voice_discovery_reference_id', referenceId);
      sessionStorage.setItem('vtl_voice_discovery_mode', 'voice_recording');
      setStatus('Your Voice Discovery has been securely stored. Redirecting to confirmation.');
      window.setTimeout(() => location.assign(new URL('../thank-you/', document.baseURI).href), 500);
    } catch (error) {
      console.error(error);
      setStatus(error.message === 'voice_backend_not_configured' ? 'Secure voice submission is not enabled on this site yet. Your local clips were not submitted or reported as received.' : 'Secure upload could not be completed. Your accepted clips remain available on this page; retry when the connection is restored.', true);
    } finally { finishButton.disabled = false; }
  };
  const beginRecording = async () => {
    if (!recordingConsent.checked || !transcriptionConsent.checked) { consents.hidden = false; setStatus('Please authorize recording and private transcription before recording an answer.', true); recordingConsent.focus(); return; }
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) { setStatus('This browser cannot record audio here. Please use the written discovery or request a guided call below.', true); return; }
    clearCurrentClip();
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'].find((type) => MediaRecorder.isTypeSupported(type)) || '';
      mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunks = [];
      mediaRecorder.addEventListener('dataavailable', (event) => { if (event.data.size) chunks.push(event.data); });
      mediaRecorder.addEventListener('stop', () => { stopTimer(); stopStream(); currentBlob = new Blob(chunks, { type: mediaRecorder.mimeType || 'audio/webm' }); currentUrl = URL.createObjectURL(currentBlob); playback.src = currentUrl; playback.hidden = false; state.textContent = 'Answer ready'; help.textContent = 'Listen back, re-record this answer, or use it and continue to the next question.'; setButtons({ hasClip: true }); }, { once: true });
      mediaRecorder.start(); state.textContent = 'Recording'; help.textContent = 'Speak naturally. Press Stop when you are finished.'; setButtons({ recording: true }); startTimer();
    } catch (error) {
      stopStream(); const message = error.name === 'NotAllowedError' ? 'Microphone access was denied. Allow microphone access in your browser settings, or use the written discovery or a guided call below.' : error.name === 'NotFoundError' ? 'No microphone was detected. Connect a microphone or use the written discovery or a guided call below.' : 'We could not start the microphone. Please try again or use another discovery pathway.'; setStatus(message, true); state.textContent = 'Microphone unavailable';
    }
  };
  startButton.addEventListener('click', beginRecording);
  stopButton.addEventListener('click', () => { if (mediaRecorder?.state === 'recording') { mediaRecorder.stop(); state.textContent = 'Preparing playback'; setButtons({ recording: true }); } });
  playButton.addEventListener('click', () => playback.play());
  againButton.addEventListener('click', () => { clearCurrentClip(); state.textContent = 'Ready to re-record'; help.textContent = 'Press Record Answer when you are ready to try this prompt again.'; startButton.focus(); });
  acceptButton.addEventListener('click', () => { if (!currentBlob) return; clips[promptIndex] = { blob: currentBlob, mimeType: currentBlob.type, durationSeconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000)) }; uploadState[promptIndex] = { recording_status: recordingStatuses[0], transcription_status: transcriptionStatuses[0] }; if (promptIndex < prompts.length - 1) { promptIndex += 1; clearCurrentClip(); showPrompt(); promptText.focus?.(); } else { setButtons(); state.textContent = 'All answers ready'; submitPanel.hidden = false; setStatus('All six answers are ready. Add your contact details below to begin secure upload.', false); submitPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); } });
  finishButton.addEventListener('click', finishDiscovery);
  window.addEventListener('beforeunload', (event) => { if (mediaRecorder?.state === 'recording' || acceptedCount()) { event.preventDefault(); event.returnValue = ''; } });
  consents.hidden = false;
  showPrompt();
})();
