var Class = require('../../utils/Class');
var BaseSound = require('../BaseSound');
//  Phaser.Sound.WebAudioSound
// TODO support webkitAudioContext implementation differences
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Porting_webkitAudioContext_code_to_standards_based_AudioContext
var WebAudioSound = new Class({
    Extends: BaseSound,
    initialize: function WebAudioSound(manager, key, config) {
        if (config === void 0) { config = {}; }
        /**
         * [description]
         *
         * @private
         * @property {AudioBuffer} audioBuffer
         */
        this.audioBuffer = manager.game.cache.audio.get(key);
        if (!this.audioBuffer) {
            console.error('No audio loaded in cache with key: \'' + key + '\'!');
            return;
        }
        /**
         * [description]
         *
         * @private
         * @property {AudioBufferSourceNode} source
         */
        this.source = null;
        /**
         * [description]
         *
         * @private
         * @property {GainNode} muteNode
         */
        this.muteNode = manager.context.createGain();
        /**
         * [description]
         *
         * @private
         * @property {GainNode} volumeNode
         */
        this.volumeNode = manager.context.createGain();
        /**
         * The time the previous playback started at based on
         * BaseAudioContext.currentTime value.
         *
         * @private
         * @property {number} startTime
         */
        this.startTime = 0;
        /**
         * An array where we keep track of all rate updates during playback.
         *
         * @private
         * @property {{ time: number, rate: number }[]} rateUpdates
         */
        this.rateUpdates = [];
        /**
         * Used for keeping track when sound source playback has ended
         * so it's state can be updated accordingly.
         *
         * @private
         * @property {boolean} hasEnded
         */
        this.hasEnded = false;
        this.muteNode.connect(this.volumeNode);
        this.volumeNode.connect(manager.destination);
        this.duration = this.audioBuffer.duration;
        this.totalDuration = this.audioBuffer.duration;
        BaseSound.call(this, manager, key, config);
    },
    play: function (markerName, config) {
        if (!BaseSound.prototype.play.call(this, markerName, config)) {
            return null;
        }
        //  \/\/\/ isPlaying = true, isPaused = false \/\/\/
        this.stopAndRemoveBufferSource();
        this.createAndStartBufferSource();
        return this;
    },
    pause: function () {
        if (!BaseSound.prototype.pause.call(this)) {
            return false;
        }
        //  \/\/\/ isPlaying = false, isPaused = true \/\/\/
        this.currentConfig.seek = this.getCurrentTime(); // Equivalent to setting paused time
        this.stopAndRemoveBufferSource();
        return true;
    },
    resume: function () {
        if (!BaseSound.prototype.resume.call(this)) {
            return false;
        }
        //  \/\/\/ isPlaying = true, isPaused = false \/\/\/
        this.createAndStartBufferSource();
        return true;
    },
    stop: function () {
        if (!BaseSound.prototype.stop.call(this)) {
            return false;
        }
        //  \/\/\/ isPlaying = false, isPaused = false \/\/\/
        this.stopAndRemoveBufferSource();
        return true;
    },
    /**
     * Used internally to do what the name says.
     *
     * @private
     */
    // TODO add delay param
    createAndStartBufferSource: function () {
        var _this = this;
        var seek = this.currentConfig.seek;
        var offset = (this.currentMarker ? this.currentMarker.start : 0) + seek;
        var duration = this.duration - seek;
        this.startTime = this.manager.context.currentTime - seek;
        this.source = this.manager.context.createBufferSource();
        this.source.buffer = this.audioBuffer;
        this.source.connect(this.muteNode);
        this.source.onended = function (ev) {
            if (ev.target === _this.source) {
                // sound ended
                if (_this.currentConfig.loop) {
                    _this.resetConfig();
                    _this.createAndStartBufferSource();
                }
                else {
                    _this.hasEnded = true;
                }
            }
            // else was stopped
        };
        this.applyConfig();
        this.source.start(0, Math.max(0, offset), Math.max(0, duration));
        this.resetConfig();
    },
    /**
     * Used internally to do what the name says.
     *
     * @private
     */
    stopAndRemoveBufferSource: function () {
        if (this.source) {
            this.source.stop();
            this.source = null;
        }
        this.startTime = 0;
    },
    /**
     * @protected
     */
    applyConfig: function () {
        this.rateUpdates.length = 0;
        this.rateUpdates.push({
            time: 0,
            rate: 1
        });
        BaseSound.prototype.applyConfig.call(this);
    },
    /**
     * Update method called on every game step.
     *
     * @param {number} time - The current timestamp as generated by the Request Animation Frame or SetTimeout.
     * @param {number} delta - The delta time elapsed since the last frame.
     */
    update: function (time, delta) {
        if (this.hasEnded) {
            this.hasEnded = false;
            this.stop();
        }
    },
    destroy: function () {
        BaseSound.prototype.destroy.call(this);
        this.audioBuffer = null;
        this.stopAndRemoveBufferSource();
        this.muteNode.disconnect();
        this.muteNode = null;
        this.volumeNode.disconnect();
        this.volumeNode = null;
        this.rateUpdates = null;
    },
    /**
     * @private
     */
    setRate: function () {
        BaseSound.prototype.setRate.call(this);
        if (this.source) {
            this.source.playbackRate.setValueAtTime(this.totalRate, 0);
        }
        if (this.isPlaying) {
            this.rateUpdates.push({
                time: this.manager.context.currentTime - this.startTime,
                rate: this.totalRate
            });
        }
    },
    /**
     * @private
     */
    getCurrentTime: function () {
        var currentTime = 0;
        for (var i = 0; i < this.rateUpdates.length; i++) {
            var nextTime = void 0;
            if (i < this.rateUpdates.length - 1) {
                nextTime = this.rateUpdates[i + 1].time;
            }
            else {
                nextTime = this.manager.context.currentTime - this.startTime;
            }
            currentTime += (nextTime - this.rateUpdates[i].time) * this.rateUpdates[i].rate;
        }
        return currentTime;
    }
});
/**
 * Mute setting.
 * @property {boolean} mute
 */
Object.defineProperty(WebAudioSound.prototype, 'mute', {
    get: function () {
        return this.muteNode.gain.value === 0;
    },
    set: function (value) {
        this.currentConfig.mute = value;
        this.muteNode.gain.setValueAtTime(value ? 0 : 1, 0);
    }
});
/**
 * Volume setting.
 * @property {number} volume
 */
Object.defineProperty(WebAudioSound.prototype, 'volume', {
    get: function () {
        return this.volumeNode.gain.value;
    },
    set: function (value) {
        this.currentConfig.volume = value;
        this.volumeNode.gain.setValueAtTime(value, 0);
    }
});
/**
 * Playback rate.
 * @property {number} rate
 */
Object.defineProperty(WebAudioSound.prototype, 'rate', {
    get: function () {
        return this.currentConfig.rate;
    },
    set: function (value) {
        this.currentConfig.rate = value;
        this.setRate();
    }
});
/**
 * Detuning of sound.
 * @property {number} detune
 */
Object.defineProperty(WebAudioSound.prototype, 'detune', {
    get: function () {
        return this.currentConfig.detune;
    },
    set: function (value) {
        this.currentConfig.detune = value;
        this.setRate();
    }
});
/**
 * Current position of playing sound.
 * @property {number} seek
 */
Object.defineProperty(WebAudioSound.prototype, 'seek', {
    get: function () {
        if (this.isPlaying) {
            return this.getCurrentTime();
        }
        else if (this.isPaused) {
            return this.currentConfig.seek;
        }
        else {
            return 0;
        }
    },
    set: function (value) {
        if (this.isPlaying || this.isPaused) {
            value = Math.min(Math.max(0, value), this.duration);
            this.currentConfig.seek = value;
        }
        if (this.isPlaying) {
            this.stopAndRemoveBufferSource();
            this.createAndStartBufferSource();
        }
    }
});
/**
 * Property indicating whether or not
 * the sound or current sound marker will loop.
 *
 * @property {boolean} loop
 */
Object.defineProperty(WebAudioSound.prototype, 'loop', {
    get: function () {
        return this.currentConfig.loop;
    },
    set: function (value) {
        this.currentConfig.loop = value;
    }
});
module.exports = WebAudioSound;
