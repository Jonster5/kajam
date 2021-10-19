export const actx = new AudioContext();

export class Sound {
	actx: AudioContext;
	volumeNode: GainNode;
	panNode: StereoPannerNode;
	convolverNode: ConvolverNode;
	delayNode: DelayNode;
	feedbackNode: GainNode;
	filterNode: BiquadFilterNode;
	soundNode: AudioBufferSourceNode;
	buffer: AudioBuffer;
	loop: boolean = false;
	playing: boolean;
	panValue: number = 0;
	volumeValue: number;
	startTime: number = 0;
	startOffset: number = 0;
	playbackRate: number = 1;
	randomPitch: boolean = true;
	reverb: boolean = false;
	reverbImpulse: AudioBuffer;
	echo: boolean = false;
	delayValue: number = 0.3;
	feebackValue: number = 0.3;
	filterValue: number = 0;
	startPoint: number;
	endPoint: number;
	constructor(actx: AudioContext, source: AudioBuffer) {
		//Assign the `source` and `loadHandler` values to this object
		this.buffer = source;

		//Set the default properties
		this.actx = actx;
		this.volumeNode = this.actx.createGain();
		this.panNode = this.actx.createStereoPanner();
		this.convolverNode = this.actx.createConvolver();
		this.delayNode = this.actx.createDelay();
		this.feedbackNode = this.actx.createGain();
		this.filterNode = this.actx.createBiquadFilter();
	}
	play() {
		//Set the time to start the sound (immediately)
		this.startTime = this.actx.currentTime;

		//Create a sound node
		this.soundNode = this.actx.createBufferSource();

		//Set the sound node's buffer property to the loaded sound
		this.soundNode.buffer = this.buffer;

		//Connect all the nodes
		this.soundNode.connect(this.volumeNode);
		//If there's no reverb, bypass the convolverNode
		if (this.reverb === false) {
			this.volumeNode.connect(this.panNode);
		}
		//If there is reverb, connect the `convolverNode` and apply
		//the impulse response
		else {
			this.volumeNode.connect(this.convolverNode);
			this.convolverNode.connect(this.panNode);
			this.convolverNode.buffer = this.reverbImpulse;
		}
		this.panNode.connect(this.actx.destination);

		//To create the echo effect, connect the volume to the
		//delay, the delay to the feedback, and the feedback to the
		//destination
		if (this.echo) {
			this.feedbackNode.gain.value = this.feebackValue;
			this.delayNode.delayTime.value = this.delayValue;
			this.filterNode.frequency.value = this.filterValue;
			this.delayNode.connect(this.feedbackNode);
			if (this.filterValue > 0) {
				this.feedbackNode.connect(this.filterNode);
				this.filterNode.connect(this.delayNode);
			} else {
				this.feedbackNode.connect(this.delayNode);
			}
			this.volumeNode.connect(this.delayNode);
			this.delayNode.connect(this.panNode);
		}

		//Will the sound loop? This can be `true` or `false`
		this.soundNode.loop = this.loop;

		//Set the playback rate
		this.soundNode.playbackRate.value = this.playbackRate;

		//Finally, use the `start` method to play the sound.
		//The start time will either be `currentTime`,
		//or a later time if the sound was paused
		this.soundNode.start(this.startTime, this.startOffset % this.buffer.duration);

		//Set `playing` to `true` to help control the
		//`pause` and `restart` methods
		this.playing = true;
	}
	get volume() {
		return this.volumeValue;
	}
	set volume(value) {
		this.volumeNode.gain.value = value;
		this.volumeValue = value;
	}

	get pan() {
		return this.panNode.pan.value;
	}
	set pan(value: number) {
		this.panNode.pan.value = value;
	}
	setReverb(duration = 2, decay = 2, reverse = false) {
		this.reverb = true;

		let length = this.actx.sampleRate * duration;

		let impulse = this.actx.createBuffer(2, length, this.actx.sampleRate);

		let left = impulse.getChannelData(0),
			right = impulse.getChannelData(1);

		for (let i = 0; i < length; i++) {
			let n = reverse ? length - i : i;
			left[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
			right[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
		}
		this.reverbImpulse = impulse;
	}

	setEcho(delayValue = 0.3, feedbackValue = 0.3, filterValue = 0) {
		this.delayValue = delayValue;
		this.feebackValue = feedbackValue;
		this.filterValue = filterValue;
		this.echo = true;
	}

	pause() {
		//Pause the sound if it's playing, and calculate the
		//`startOffset` to save the current position
		if (this.playing) {
			this.soundNode.stop(this.actx.currentTime);
			this.startOffset += this.actx.currentTime - this.startTime;
			this.playing = false;
			return this.startOffset;
		} else return;
	}

	restart() {
		//Stop the sound if it's playing, reset the start and offset times,
		//then call the `play` method again
		if (this.playing) {
			this.soundNode.stop(this.actx.currentTime);
		}
		this.startOffset = 0;
		this.startPoint = 0;
		this.endPoint = this.buffer.duration;
		this.play();
	}

	playFrom(value: number) {
		if (this.playing) {
			this.soundNode.stop(this.actx.currentTime);
		}
		this.startOffset = value;
		this.play();
	}

	//An experimental `playSection` method used to play a section of a
	//sound
	playSection(start: number, end: number) {
		if (this.playing) {
			this.soundNode.stop(this.actx.currentTime);
		}

		if (this.startOffset === 0) this.startOffset = start;

		//Set the time to start the sound (immediately)
		this.startTime = this.actx.currentTime;

		//Create a sound node
		this.soundNode = this.actx.createBufferSource();

		//Set the sound node's buffer property to the loaded sound
		this.soundNode.buffer = this.buffer;

		//Connect the sound to the pan, connect the pan to the
		//volume, and connect the volume to the destination
		this.soundNode.connect(this.panNode);
		this.panNode.connect(this.volumeNode);
		this.volumeNode.connect(this.actx.destination);

		//Will the sound loop? This can be `true` or `false`
		this.soundNode.loop = this.loop;
		this.soundNode.loopStart = start;
		this.soundNode.loopEnd = end;

		//Find out what the duration of the sound is
		let duration = end - start;

		//Finally, use the `start` method to play the sound.
		//The start time will either be `currentTime`,
		//or a later time if the sound was paused
		this.soundNode.start(this.startTime, this.startOffset % this.buffer.duration, duration);

		//Set `playing` to `true` to help control the
		//`pause` and `restart` methods
		this.playing = true;
	}
}

export async function SoundEffect(
	actx: AudioContext,
	frequencyValue: number,
	attack: number = 0,
	decay: number = 1,
	type: OscillatorType = 'sine',
	volumeValue: number = 1,
	panValue: number = 0,
	wait: number = 0,
	pitchBendAmount: number = 0,
	reverse: boolean = false,
	randomValue: number = 0,
	dissonance: number = 0,
	echo: number[] = undefined,
	reverb: any[] = undefined
) {
	//Create oscillator, gain and pan nodes, and connect them
	//together to the destination
	let oscillator = actx.createOscillator(),
		volume = actx.createGain(),
		pan = actx.createStereoPanner();

	oscillator.connect(volume);
	volume.connect(pan);
	pan.connect(actx.destination);

	//Set the supplied values
	volume.gain.value = volumeValue;
	pan.pan.value = panValue;
	oscillator.type = type;

	//Optionally randomize the pitch. If the `randomValue` is greater
	//than zero, a random pitch is selected that's within the range
	//specified by `frequencyValue`. The random pitch will be either
	//above or below the target frequency.
	let frequency: number;
	let randomInt = (min: number, max: number) => {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};
	if (randomValue > 0) {
		frequency = randomInt(frequencyValue - randomValue / 2, frequencyValue + randomValue / 2);
	} else {
		frequency = frequencyValue;
	}
	oscillator.frequency.value = frequency;

	//Apply effects
	if (attack > 0) fadeIn(volume);
	if (decay > 0) fadeOut(volume);
	if (pitchBendAmount > 0) pitchBend(oscillator);
	if (echo) addEcho(volume);
	if (reverb) addReverb(volume);
	if (dissonance > 0) addDissonance();

	//Play the sound
	play(oscillator);

	//The helper functions:
	//Reverb
	function addReverb(volumeNode: GainNode) {
		let convolver = actx.createConvolver();
		convolver.buffer = impulseResponse(reverb[0], reverb[1], reverb[2]);
		volumeNode.connect(convolver);
		convolver.connect(pan);
	}

	//Echo
	function addEcho(volumeNode: GainNode) {
		//Create the nodes
		let feedback = actx.createGain(),
			delay = actx.createDelay(),
			filter = actx.createBiquadFilter();

		//Set their values (delay time, feedback time and filter frequency)
		delay.delayTime.value = echo[0];
		feedback.gain.value = echo[1];
		if (echo[2]) filter.frequency.value = echo[2];

		//Create the delay feedback loop, with
		//optional filtering
		delay.connect(feedback);
		if (echo[2]) {
			feedback.connect(filter);
			filter.connect(delay);
		} else {
			feedback.connect(delay);
		}

		//Connect the delay loop to the oscillator's volume
		//node, and then to the destination
		volumeNode.connect(delay);

		//Connect the delay loop to the main sound chain's
		//pan node, so that the echo effect is directed to
		//the correct speaker
		delay.connect(pan);
	}

	//Fade in (the sound’s “attack”)
	function fadeIn(volumeNode: GainNode) {
		//Set the volume to 0 so that you can fade in from silence
		volumeNode.gain.value = 0;

		volumeNode.gain.linearRampToValueAtTime(0, actx.currentTime + wait);
		volumeNode.gain.linearRampToValueAtTime(volumeValue, actx.currentTime + wait + attack);
	}

	//Fade out (the sound’s “decay”)
	function fadeOut(volumeNode: GainNode) {
		volumeNode.gain.linearRampToValueAtTime(volumeValue, actx.currentTime + attack + wait);
		volumeNode.gain.linearRampToValueAtTime(0, actx.currentTime + wait + attack + decay);
	}

	//Pitch bend.
	//Uses `linearRampToValueAtTime` to bend the sound’s frequency up or down
	function pitchBend(oscillatorNode: OscillatorNode) {
		//Get the frequency of the current oscillator
		let frequency = oscillatorNode.frequency.value;

		//If `reverse` is true, make the sound drop in pitch.
		//(Useful for shooting sounds)
		if (!reverse) {
			oscillatorNode.frequency.linearRampToValueAtTime(frequency, actx.currentTime + wait);
			oscillatorNode.frequency.linearRampToValueAtTime(
				frequency - pitchBendAmount,
				actx.currentTime + wait + attack + decay
			);
		}

		//If `reverse` is false, make the note rise in pitch.
		//(Useful for jumping sounds)
		else {
			oscillatorNode.frequency.linearRampToValueAtTime(frequency, actx.currentTime + wait);
			oscillatorNode.frequency.linearRampToValueAtTime(
				frequency + pitchBendAmount,
				actx.currentTime + wait + attack + decay
			);
		}
	}

	//Dissonance
	function addDissonance() {
		//Create two more oscillators and gain nodes
		let d1 = actx.createOscillator(),
			d2 = actx.createOscillator(),
			d1Volume = actx.createGain(),
			d2Volume = actx.createGain();

		//Set the volume to the `volumeValue`
		d1Volume.gain.value = volumeValue;
		d2Volume.gain.value = volumeValue;

		//Connect the oscillators to the gain and destination nodes
		d1.connect(d1Volume);
		d1Volume.connect(actx.destination);
		d2.connect(d2Volume);
		d2Volume.connect(actx.destination);

		//Set the waveform to "sawtooth" for a harsh effect
		d1.type = 'sawtooth';
		d2.type = 'sawtooth';

		//Make the two oscillators play at frequencies above and
		//below the main sound's frequency. Use whatever value was
		//supplied by the `dissonance` argument
		d1.frequency.value = frequency + dissonance;
		d2.frequency.value = frequency - dissonance;

		//Apply effects to the gain and oscillator
		//nodes to match the effects on the main sound
		if (attack > 0) {
			fadeIn(d1Volume);
			fadeIn(d2Volume);
		}
		if (decay > 0) {
			fadeOut(d1Volume);
			fadeOut(d2Volume);
		}
		if (pitchBendAmount > 0) {
			pitchBend(d1);
			pitchBend(d2);
		}
		if (echo) {
			addEcho(d1Volume);
			addEcho(d2Volume);
		}
		if (reverb) {
			addReverb(d1Volume);
			addReverb(d2Volume);
		}

		//Play the sounds
		play(d1);
		play(d2);
	}

	function play(oscillatorNode: OscillatorNode) {
		oscillatorNode.start(actx.currentTime + wait);
	}
	function impulseResponse(duration = 2, decay = 2, reverse: boolean) {
		const length = actx.sampleRate * duration;

		let impulse = actx.createBuffer(2, length, actx.sampleRate);

		let left = impulse.getChannelData(0),
			right = impulse.getChannelData(1);

		for (let i = 0; i < length; i++) {
			let n = reverse ? length - i : i;

			left[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
			right[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
		}
		return impulse;
	}
}
