function exportValue(name, value) {
    window[name] = value
}

const RGB_MAX = 128
const HUE_MAX = 360
const SV_MAX = 128


let colorsys = window.colorsys = {};

colorsys.rgb2Hsl = function (r, g, b) {
    if (typeof r === 'object') {
        const args = r
        r = args.r;
        g = args.g;
        b = args.b;
    }
    // It converts [0,255] format, to [0,1]
    r = r % RGB_MAX / parseFloat(RGB_MAX)
    g = g % RGB_MAX / parseFloat(RGB_MAX)
    b = b % RGB_MAX / parseFloat(RGB_MAX)

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b)
    let h
    let s
    let l = (max + min) / 2

    if (max === min) {
        h = s = 0 // achromatic
    } else {
        let d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0)
                break
            case g:
                h = (b - r) / d + 2
                break
            case b:
                h = (r - g) / d + 4
                break
        }
        h /= 6
    }

    return {
        h: Math.floor(h * HUE_MAX), s: Math.floor(s * SV_MAX), l: Math.floor(l * SV_MAX)
    }
}

colorsys.rgb_to_hsl = colorsys.rgb2Hsl
colorsys.rgbToHsl = colorsys.rgb2Hsl

colorsys.rgb2Hsv = function (r, g, b) {
    if (typeof r === 'object') {
        const args = r
        r = args.r;
        g = args.g;
        b = args.b;
    }

    // It converts [0,255] format, to [0,1]
    r = r % RGB_MAX / parseFloat(RGB_MAX)
    g = g % RGB_MAX / parseFloat(RGB_MAX)
    b = b % RGB_MAX / parseFloat(RGB_MAX)

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h
    let s
    let v = max

    let d = max - min

    s = max === 0 ? 0 : d / max

    if (max === min) {
        h = 0 // achromatic
    } else {
        switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0)
                break
            case g:
                h = (b - r) / d + 2
                break
            case b:
                h = (r - g) / d + 4
                break
        }
        h /= 6
    }

    return {
        h: Math.floor(h * HUE_MAX), s: Math.floor(s * SV_MAX), v: Math.floor(v * SV_MAX)
    }
}

colorsys.rgb_to_hsv = colorsys.rgb2Hsv
colorsys.rgbToHsv = colorsys.rgb2Hsv

colorsys.hsl2Rgb = function (h, s, l) {
    if (typeof r === 'object') {
        const args = h
        h = args.h;
        s = args.s;
        l = args.l;
    }

    let r, g, b

    h = h === HUE_MAX ? 1 : (h % HUE_MAX / parseFloat(HUE_MAX) * 6)
    s = s === SV_MAX ? 1 : (s % SV_MAX / parseFloat(SV_MAX))
    l = l === SV_MAX ? 1 : (l % SV_MAX / parseFloat(SV_MAX))

    if (s === 0) {
        r = g = b = l // achromatic
    } else {
        const hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1
            if (t > 1) t -= 1
            if (t < 1 / 6) return p + (q - p) * 6 * t
            if (t < 1 / 2) return q
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
            return p
        }

        let q = l < 0.5 ? l * (1 + s) : l + s - l * s
        let p = 2 * l - q
        r = hue2rgb(p, q, h + 1 / 3)
        g = hue2rgb(p, q, h)
        b = hue2rgb(p, q, h - 1 / 3)
    }
    return {r: Math.round(r * RGB_MAX), g: Math.round(g * RGB_MAX), b: Math.round(b * RGB_MAX)}
}

colorsys.hsl_to_rgb = colorsys.hsl2Rgb
colorsys.hslToRgb = colorsys.hsl2Rgb

colorsys.hsv2Rgb = function (h, s, v) {
    if (typeof h === 'object') {
        const args = h
        h = args.h;
        s = args.s;
        v = args.v;
    }

    h = h === HUE_MAX ? 1 : (h % HUE_MAX / parseFloat(HUE_MAX) * 6)
    s = s === SV_MAX ? 1 : (s % SV_MAX / parseFloat(SV_MAX))
    v = v === SV_MAX ? 1 : (v % SV_MAX / parseFloat(SV_MAX))

    const i = Math.floor(h);
    const f = h - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    const mod = i % 6;
    const r = [v, q, p, p, t, v][mod];
    const g = [t, v, v, q, p, p][mod];
    const b = [p, p, t, v, v, q][mod];

    return {r: Math.round(r * RGB_MAX), g: Math.round(g * RGB_MAX), b: Math.round(b * RGB_MAX)}
}

colorsys.hsv_to_rgb = colorsys.hsv2Rgb
colorsys.hsvToRgb = colorsys.hsv2Rgb


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * @constructor
 * @param {number} position
 */
class LaunchpadColorSpecBase {
    constructor(position) {
        this.position = position
    }

    get colorData() {
        return []
    }

    // Subclass this
    get lightType() {
        return null
    }

    get sysexMessage() {
        return [this.lightType, this.position].concat(this.colorData)
    }

    copy(position = null) {
        let c = Object.assign(Object.create(Object.getPrototypeOf(this)), this)
        if (position) {
            c.position = position
        }
        return c
    }
}

class LaunchpadStaticColor extends LaunchpadColorSpecBase {
    constructor(position, palletColor) {
        super(position);
        this.palletColor = palletColor
    }

    get lightType() {
        return 0
    }

    get colorData() {
        return [this.palletColor]
    }
}

class LaunchpadFlashingColor extends LaunchpadColorSpecBase {
    constructor(position, palletColorA, palletColorB) {
        super(position);
        this.palletColorA = palletColorA
        this.palletColorB = palletColorB
    }

    get lightType() {
        return 1
    }

    get colorData() {
        return [this.palletColorA, this.palletColorB]
    }
}

class LaunchpadPulsingColor extends LaunchpadColorSpecBase {
    constructor(position, palletColor) {
        super(position);
        this.palletColor = palletColor
    }

    get lightType() {
        return 2
    }

    get colorData() {
        return [this.palletColor]
    }
}

class LaunchpadRGBColor extends LaunchpadColorSpecBase {
    constructor(position, r, g, b) {
        super(position)
        this.r = r
        this.g = g
        this.b = b
    }

    get lightType() {
        return 3
    }

    get colorData() {
        return [this.r, this.g, this.b]
    }
}


/**
 * Represents a full set of color messages
 * @constructor
 * @param {LaunchpadColorSpecBase[]} colorSpecs
 */
class LaunchpadColorSysexMessage {
    constructor(colorSpecs) {
        this.colorSpecs = colorSpecs
    }

    get sysexBeginning() {
        return [3]
    }

    get colorSpecArray() {
        return this.colorSpecs.map(function (i) {
            return i.sysexMessage
        }).flat()
    }

    /**
     * Get the sysex message (Without header or stop use the Launchpad class makeSysexMessage)
     * @returns {number[]}
     */
    get sysexMessage() {
        return this.sysexBeginning.concat(this.colorSpecArray)
    }
}

class LaunchpadStorage {
    async getValue(key, defaultValue) {
        throw new Error('Not a subclassed LaunchpadStorage')
    }

    setValue(key, value) {
        throw new Error('Not a subclassed LaunchpadStorage')
    }

    async deleteValue(key) {
        throw new Error('Not a subclassed LaunchpadStorage')
    }
}

class LaunchpadGMStorage extends LaunchpadStorage {
    async getValue(key, defaultValue) {
        return await GM.getValue(key, defaultValue)
    }

    setValue(key, value) {
        GM.setValue(key, value)
    }

    async deleteValue(key) {
        await GM.deleteValue(key)
    }
}

class LaunchpadLocalStorage extends LaunchpadStorage {
    async getValue(key, defaultValue) {
        let i = localStorage.getItem(key)
        if (defaultValue && i === null) {
            return defaultValue
        } else {
            return JSON.parse(i);
        }
    }

    setValue(key, value) {
        localStorage.setItem(key, JSON.stringify(value))
    }

    async deleteValue(key) {
        localStorage.removeItem(key)
    }
}

class Launchpad {
    static sysexHeader = [240, 0, 32, 41, 2, 14];
    static sysexStop = [247]

    constructor(inputDevice, outputDevice, dawInDevice, dawOutDevice, storageClass = new LaunchpadLocalStorage()) {
        this.storageClass = storageClass
        this.isShift = false
        this.playNext = false
        this.bpmInterval = null
        this.inputDevice = inputDevice
        this.outputDevice = outputDevice
        this.dawInDevice = dawInDevice
        this.dawOutDevice = dawOutDevice
        this.nowPlayingInfo = null
        this.hue = 0
        this.colorWheelTimer = null
        this.nowPlayingImg = null
        this.nowPlayingImgCanvas = document.createElement('canvas')
        this.nowPlayingImgCanvas.width = 256
        this.nowPlayingImgCanvas.height = 256
        this.nowPlayingRGBValue = null
        this._deleteMode = false
        // this.window = window.open('', '', '')
        // this.window.document.body.appendChild(this.nowPlayingImgCanvas)
        this.mk = MusicKit.getInstance()
        this._page = 1
        this._pageMap = new Map()
        this._pageMap.set(1, [this.setPlaybackIcon, this.setPlayNextIndicator, this.setRepeatIcon, this.setAutoplay, this.setShuffle, this.setFader, this.drawProgress, this.setSongIndexColor])
        this._pageMap.set(2, [this.nowPlayingToMidiOut, this.setPlaybackIcon])
        this._pageMap.set(3, [this.getFavSongPads, this.setPlaybackIcon])
        this._pageMap.set(8, [this.setDeleteLetter, this.setSongIndexColor, this.setPlaybackIcon])
        this._pageColors = new Map()
        this._pageColors.set(1, new LaunchpadStaticColor(101, 37))
        this.clockInterval = null
        this._bpm = 60
        this.bpm = 60
    }

    get deleteMode() {
        return this._deleteMode
    }

    set deleteMode(value) {
        if (value) {
            this._deleteMode = true
            let color = new LaunchpadStaticColor(60, 5)
            this.outputDevice.send(this.makeSysexMessage(new LaunchpadColorSysexMessage([color]).sysexMessage))
        } else {
            this._deleteMode = false
            let color = new LaunchpadStaticColor(60, 3)
            this.outputDevice.send(this.makeSysexMessage(new LaunchpadColorSysexMessage([color]).sysexMessage))
        }
    }

    get page() {
        return this._page
    }

    set page(value) {
        let oldPage = this._page
        this._page = value
        if (value > 0 && value < 9) {
            let color = this._pageColors.get(this._page)
            if (color === null) {
                color = new LaunchpadStaticColor(101, 37)
            }
            this.setPage(this._page, color)
            // Don't actually change the layout if we are in shift mode
            if (!this.isShift) {
                // Don't do a full redraw if we are the same page
                if (!(this._page === oldPage)) {
                    this.clearPads([4, 5, 19, 29, 39, 49, 59, 69, 79, 89])
                }
                let pageFunctions = this._pageMap.get(this._page)
                if (pageFunctions) {
                    for (const pageFunction of pageFunctions) {
                        pageFunction.call(this)
                    }
                }
            }

            this.storageClass.setValue('page', this._page)

        }
    }

    makeSysexMessage(messageData) {
        return Launchpad.sysexHeader.concat(messageData).concat(Launchpad.sysexStop)
    }

    async colorWheel(positions = [99]) {
        let color = new LaunchpadRGBColor(0, 127, 127, 127)
        if (this.hue >= HUE_MAX - 1) {
            this.hue = 0
        }
        this.hue++
        let rgb = colorsys.hsv_to_rgb(this.hue, 127, 127)
        color.r = rgb.r
        color.g = rgb.g
        color.b = rgb.b
        let colors = []
        for (const p of positions) {
            colors = colors.concat([color.copy(p)])
        }
        this.outputDevice.send(this.makeSysexMessage(new LaunchpadColorSysexMessage(colors).sysexMessage))
    }

    setPage(pageNumber = 1, color = new LaunchpadStaticColor(101, 37)) {
        let colorArray = [color]
        for (let pos = 101; pos <= 108; pos++) {
            if (pos % 10 === pageNumber) {
                color.position = pos
            } else {
                colorArray = colorArray.concat([new LaunchpadStaticColor(pos, 0)])
            }
        }
        this.outputDevice.send(this.makeSysexMessage(new LaunchpadColorSysexMessage(colorArray).sysexMessage))
    }

    async getFavSongPads() {
        let colorArray = []
        for (let pos = 0; pos <= 89; pos++) {
            if (pos % 10 !== 9 && pos % 10 !== 0) {
                let value_index = "Song index " + pos
                // noinspection ES6RedundantAwait,JSUnresolvedVariable,JSCheckFunctionSignatures
                let stored_item = await this.storageClass.getValue(value_index)
                if (stored_item) {
                    colorArray = colorArray.concat([new LaunchpadRGBColor(pos, stored_item.rgb.r, stored_item.rgb.b, stored_item.rgb.b)])
                }
            }
            this.outputDevice.send(this.makeSysexMessage(new LaunchpadColorSysexMessage(colorArray).sysexMessage))
        }
    }

    clearPads(additional = [4], color = 0) {
        let clearArray = []
        for (let pos = 0; pos <= 89; pos++) {
            if (pos % 10 !== 9 && pos % 10 !== 0) {
                clearArray = clearArray.concat([new LaunchpadStaticColor(pos, color)])
            }
        }
        // clear fader mute button
        for (let additionalPos of additional) {
            clearArray = clearArray.concat([new LaunchpadStaticColor(additionalPos, 0)])
        }
        this.outputDevice.send(this.makeSysexMessage(new LaunchpadColorSysexMessage(clearArray).sysexMessage))
    }

    initProgrammer() {
        this.outputDevice.send(this.makeSysexMessage([14, 1]))
    }

    initDefaultPage() {
        this.setPlaybackIcon()
        this.setPlayNextIndicator()
        this.setRepeatIcon()
        this.setAutoplay()
        this.setShuffle()
        this.setFader()
        this.drawProgress()
        this.page = 1
        this.deleteMode = false
    }

    drawProgress() {
        if (!this.isShift && this.page === 1) {
            let progress
            if (!this.mk.currentPlaybackProgress) {
                progress = 0
            } else {
                progress = this.mk.currentPlaybackProgress
            }
            if (!this.mk.isPlaying) {
                this.setFader(5, progress, 127, 0, 0)
            } else {
                this.setFader(5, progress, 0, 127, 0)
            }
        }
    }

    drawLayout(layout, offsetX = 0, offsetY = 0, color = 0, clear = true, altBounding, colorSysex) {
        let bounding
        if (altBounding) {
            bounding = getBounding(altBounding)
        } else {
            bounding = getBounding(layout)
        }
        if (clear) {
            let clearArray = []
            for (let row = bounding[0]; row <= bounding[2]; row++) {
                for (let col = bounding[1]; col <= bounding[3]; col++) {
                    clearArray = clearArray.concat([new LaunchpadStaticColor((row + offsetY) * 10 + col + offsetX, 0)])
                }
            }
            this.outputDevice.send(this.makeSysexMessage(new LaunchpadColorSysexMessage(clearArray).sysexMessage))
        }
        if (colorSysex) {
            let colors = []
            layout.forEach(value => {
                let newSysex = colorSysex.copy();
                newSysex.position = value + (offsetY * 10) + offsetX;
                colors = colors.concat([newSysex])
            })
            let colorSysexMessage = new LaunchpadColorSysexMessage(colors)
            this.outputDevice.send(this.makeSysexMessage(colorSysexMessage.sysexMessage))
        } else {
            layout.forEach(value => {
                this.outputDevice.send([0x90, value + (offsetY * 10) + offsetX, color])
            })
        }
    }

    setDeleteLetter() {
        if (!this.isShift && this.page === 8) {
            this.drawLayout(largeLetterDLayout, 0, 0, 5)
        }
    }

    setPlaybackIcon() {
        let color = new LaunchpadStaticColor(20, 25)
        if (!this.mk.isPlaying) {
            if (this.mk.queueIsEmpty) {
                color = new LaunchpadFlashingColor(20, 5, 0)
                if (this.bpm !== 60) {
                    this.bpm = 60
                }
            } else {
                color.palletColor = 5
            }
        }
        if (!this.isShift && this.page === 1) {
            if (this.mk.isPlaying) {
                this.drawLayout(playButtonLayout, 0, 0, 25, true, false, color)
            } else {
                this.drawLayout(pauseButtonLayout, 0, 0, 5, true, false, color)
            }
        }
        if (this.mk.isPlaying) {
            color.palletColor = 25
            this.outputDevice.send(this.makeSysexMessage(new LaunchpadColorSysexMessage([color]).sysexMessage))
        } else {
            this.outputDevice.send(this.makeSysexMessage(new LaunchpadColorSysexMessage([color]).sysexMessage))
        }
    }

    setPlayNextIndicator() {
        if (!this.isShift && this.page === 1) {
            if (this.playNext) {
                this.drawLayout(playItemNextLayout, 0, 5, 67)
            } else {
                this.drawLayout(playItemLaterLayout, 0, 5, 67)
            }
        }
    }

    sendClockMessage() {
        this.outputDevice.send([0xf8])
    }

    get bpm() {
        return this._bpm
    }

    set bpm(value) {
        this._bpm = value
        this.setClock(this._bpm)
    }

    setClock(bpm) {
        if (this.clockInterval) {
            clearInterval(this.clockInterval)
        }
        this.clockInterval = setInterval(this.sendClockMessage.bind(this), Math.round(2500 / bpm))
    }

    setRepeatIcon() {
        if (!this.isShift && this.page === 1) {
            switch (this.mk.repeatMode) {
                case 0:
                    this.drawLayout(repeatButtonLayout, 5, 0, 1)
                    break
                case 1:
                    this.drawLayout(repeatButtonLayout, 5, 0, 25)
                    this.drawLayout(new Uint8Array([22]), 5, 0, 122)
                    break
                case 2:
                    this.drawLayout(repeatButtonLayout, 5, 0, 25)
                    break
            }
        }
    }

    setAutoplay() {
        if (!this.isShift && this.page === 1) {
            if (this.mk.autoplayEnabled) {
                this.drawLayout(autoplayLayout, 5, 5, 25)
            } else {
                this.drawLayout(autoplayLayout, 5, 5, 5)
            }
        }
    }

    setFader(col = 4, valueToCheck = null, r = 127, g = 127, b = 127, onPage = 1) {
        let color = new LaunchpadRGBColor(null, r, g, b)
        let colorArray = []
        if (valueToCheck === null) {
            valueToCheck = this.mk.volume
        }
        let maxHeight = 8
        let midi_equivalent = Math.round(valueToCheck * 128)
        if (!this.isShift && this.page === onPage) {

            let height = Math.floor(midi_equivalent / 16) + 1
            let brightness = midi_equivalent / 16 % 1 * 128
            if (brightness === 128) {
                brightness = 127
            }
            // clear colors
            for (let c = maxHeight; c >= height + 1; c--) {
                colorArray = colorArray.concat([new LaunchpadStaticColor((c * 10) + col, 0)])
            }
            for (let v = 1; v < height; v++) {
                colorArray = colorArray.concat([color.copy((v * 10) + col)])
            }
            // Set top fader
            let hsv = colorsys.rgb_to_hsv(r, g, b)
            hsv.v = brightness
            let rgb = colorsys.hsv2Rgb(hsv)
            colorArray = colorArray.concat([new LaunchpadRGBColor(height * 10 + col, rgb.r, rgb.g, rgb.b)])
        }
        // Set button under fader
        if (midi_equivalent === 128) {
            colorArray = colorArray.concat([new LaunchpadRGBColor(col, 0, 127, 0)])
        } else if (midi_equivalent === 0) {
            colorArray = colorArray.concat([new LaunchpadRGBColor(col, 127, 0, 0)])
        } else {
            colorArray = colorArray.concat([new LaunchpadRGBColor(col, midi_equivalent, midi_equivalent, midi_equivalent)])
        }
        this.outputDevice.send(this.makeSysexMessage(new LaunchpadColorSysexMessage(colorArray).sysexMessage))

    }

    setShuffle() {
        if (!this.isShift && this.page === 1) {
            if (this.mk.shuffleMode === 1) {
                this.drawLayout(shuffleLayout, 5, 3, 37)
            } else {
                this.drawLayout(shuffleLayout, 5, 3, 21)
            }
        }
    }

    async setSongIndexColor() {
        for (let i = 19; i <= 89; i = i + 10) {
            let value_index = "Item index " + i
            // noinspection ES6RedundantAwait,JSUnresolvedVariable,JSCheckFunctionSignatures
            let stored_item = await this.storageClass.getValue(value_index)
            console.log(stored_item)
            if (stored_item) {
                if (!this.isShift && this.page === 1) {
                    this.outputDevice.send(this.makeSysexMessage(new LaunchpadColorSysexMessage([new LaunchpadStaticColor(i, 15)]).sysexMessage))
                } else if (this.isShift || this.page === 8) {
                    this.outputDevice.send(this.makeSysexMessage(new LaunchpadColorSysexMessage([new LaunchpadStaticColor(i, 5)]).sysexMessage))
                }
            }
        }
    }

    RGBAToLaunchpad(imageData) {
        // Cursed code to convert an eight by eight RGBA to SysEx commands
        let lp_position = 11
        let out_array = launchpadHeader.concat([3, 3, lp_position])
        for (let pos = 0; pos < imageData.length; pos++) {
            // every 4th item is the alpha channel which we ignore
            if ((pos + 1) % 4 === 0) {
                lp_position++
                if (lp_position % 10 === 9) {
                    lp_position = lp_position + 2
                }
                out_array = out_array.concat([3, lp_position])
            } else {
                out_array = out_array.concat([Math.floor(imageData[pos] / 2)])
            }
        }
        console.log(out_array.concat([247]))
        return out_array.concat([247])
    }


    nowPlayingToMidiOut(event) {
        let ctx = this.nowPlayingImgCanvas.getContext('2d')
        let img = this.nowPlayingImg
        if (img) {
            // flip the image
            ctx.save()
            ctx.scale(1, -1)
            ctx.scale(1 / 32, 1 / 32)
            ctx.drawImage(img, 0, img.height * -1, img.width, img.height)
            let imgData = ctx.getImageData(0, 0, 8, 8).data;
            console.log(imgData)
            this.outputDevice.send(this.RGBAToLaunchpad(imgData))
            ctx.restore()
        }
    }


    imgToLaunchpadRGB(position = 99, event = null) {
        try {
            let context = this.nowPlayingImgCanvas.getContext('2d'), i = -4, count = 0, rgb = {r: 0, g: 0, b: 0}
            context.save()
            context.drawImage(this.nowPlayingImg, 0, 0)
            let data = context.getImageData(0, 0, this.nowPlayingImg.width, this.nowPlayingImg.height)
            while ((i += 4) < data.data.length) {
                ++count;
                rgb.r += data.data[i];
                rgb.g += data.data[i + 1];
                rgb.b += data.data[i + 2];
            }
            rgb.r = ~~(rgb.r / count);
            rgb.g = ~~(rgb.g / count);
            rgb.b = ~~(rgb.b / count);
            context.restore()
            this.nowPlayingRGBValue = new LaunchpadRGBColor(position, Math.floor(rgb.r / 2), Math.floor(rgb.g / 2), Math.floor(rgb.b / 2))
            console.log("Setting RGB Color")
            console.log(this.nowPlayingRGBValue)
            let sysex = this.makeSysexMessage(new LaunchpadColorSysexMessage([this.nowPlayingRGBValue]).sysexMessage)
            this.outputDevice.send(sysex)
            if (this.isShift || this.page === 2) {
                this.nowPlayingToMidiOut('')
            }
        } catch (e) {
            console.log(e)
        }
    }

    nowPlayingToRGB(position = 99, imageUrl) {
        this.nowPlayingImg = new Image(256, 256);
        if (this.mk.nowPlayingItem || imageUrl) {
            if (imageUrl) {
                this.nowPlayingImg.src = imageUrl.replace('{w}', '256').replace('{h}', '256');
                this.nowPlayingImg.crossOrigin = "Anonymous";
                this.nowPlayingImg.addEventListener("load", this.imgToLaunchpadRGB.bind(this, position))
            } else {
                if (this.mk.nowPlayingItem.artworkURL) {
                    this.nowPlayingImg.src = this.mk.nowPlayingItem.artworkURL.replace('{w}', '256').replace('{h}', '256');
                    this.nowPlayingImg.crossOrigin = "Anonymous";
                    this.nowPlayingImg.addEventListener("load", this.imgToLaunchpadRGB.bind(this, position))
                }
            }

        }
    }
}

function playPage() {
    let urlSlices = window.location.href.split('/')
    let id = urlSlices.slice(-1)[0].split('?').slice(0)[0]
    console.log(urlSlices)
    console.log(id)
    if (urlSlices.slice(-2, -1)[0] === 'albums') {
        return {album: id}
    }
    if (urlSlices.slice(-2, -1)[0] === 'playlist') {
        return {playlist: id}
    }
    if (urlSlices.slice(-3, -2)[0] === 'album') {
        return {album: id}
    }
}

let launchpadHeader = [240, 0, 32, 41, 2, 14];


let playButtonLayout = new Uint8Array([11, 12, 21, 23, 31, 32])
let pauseButtonLayout = new Uint8Array([11, 13, 21, 23, 31, 33])
let repeatButtonLayout = new Uint8Array([12, 13, 21, 23, 31, 32])
let autoplayLayout = new Uint8Array([11, 13, 21, 22, 23, 31, 32, 33])
let shuffleLayout = new Uint8Array([11, 12, 13, 21, 22, 23])
let playItemNextLayout = new Uint8Array([11, 21, 22, 31, 32, 33])
let largeLetterDLayout = new Uint8Array([11, 12, 13, 14, 15, 16, 22, 27, 32, 38, 42, 48, 52, 58, 62, 68, 72, 77, 81, 82, 83, 84, 85, 86])
let largeLetterN = new Uint8Array([11, 14, 21, 23, 24, 31, 32, 34, 41, 44])
let largeLetterL = new Uint8Array([11, 12, 13, 21, 31, 41])
let letterPLayout = new Uint8Array([11, 21, 22, 23, 31, 32, 33])
let playItemLaterLayout = new Uint8Array([11, 12, 13, 21, 22, 31])
let playPauseBox = new Uint8Array([11, 12, 13, 21, 22, 23, 31, 32, 33])
let repeatBox = playPauseBox.map(value => value + 5)
let autoplayBox = playPauseBox.map(value => value + 55)
let shuffleBox = shuffleLayout.map(value => value + 35)
let letterBox = playPauseBox.map(value => value + 50)
let centerBox = new Uint8Array([44, 45, 54, 55])

function getBounding(layoutArray) {
    let rows = [];
    let col = [];
    for (const layoutArrayElement of layoutArray) {
        rows.push(Math.floor(layoutArrayElement * 0.1))
        col.push(layoutArrayElement % 10)
    }
    return [Math.min(...rows), Math.min(...col), Math.max(...rows), Math.max(...col)]
}

let midiNoteState = new Map()
let midiActions = new Map()
midiActions.set('8', 'NoteOff')
midiActions.set('9', 'NoteOn')
midiActions.set('b', 'CC')
midiActions.set('c', 'ProgChange')
midiActions.set('d', 'Aftertouch')
midiActions.set('f', 'SysEx')

let launchpadLayout = new Map()
launchpadLayout.set(0, 'Session')
launchpadLayout.set(1, 'Fader')
launchpadLayout.set(2, 'Chord')
launchpadLayout.set(3, 'Custom')
const faderMultiplier = 2


class LaunchpadSysExLayout {
    constructor(pageMessage) {
        this.messageType = 'LaunchpadSysExPage'
        this.message = pageMessage
    }

    get layout() {
        return launchpadLayout.get(this.message[1])
    }

    get page() {
        return this.message[2]
    }
}


class MidiNote {
    constructor(note) {
        this.timeStamp = note.timeStamp
        this.noteTargetName = note.target.name
        this.functionHex = note.data[0].toString(16)
        if (this.functionHex !== 'f8') {
            this.action = midiActions.get(this.functionHex[0])
        } else {
            this.action = 'Clock'
        }
        this.data = note.data
        if (this.action === 'SysEx') {
            if (note.data.length > 6) {
                this.header = note.data.slice(0, 6)
            }
            if (this.header) {
                if (areEqual(this.header, launchpadHeader)) {
                    this.sysexType = "Launchpad"
                    this.message = note.data.slice(6)
                    if (this.message[0] === 0 && this.message.length === 5) {
                        this.sysexEvent = 'Layout'
                        this.sysex = new LaunchpadSysExLayout(this.message)
                    }
                }

            }

        } else {
            this.channel = parseInt(this.functionHex[1], 16)
            this.number = note.data[1]
            this.velocity = note.data[2]
            this.previousAction = midiNoteState.get(this.channelPair)
            if (["NoteOn", "NoteOff"].includes(this.action)) {
                if (this.velocity === 0) {
                    midiNoteState.set(this.channelPair, "NoteOff")
                } else {
                    midiNoteState.set(this.channelPair, this.action)
                }
            }
        }
    }

    // Channel and note number for getting previous states
    get channelPair() {
        if (this.action !== 'SysEx') {
            return this.channel + ',' + this.number
        }
    }

    get wasOn() {
        if (this.action !== 'SysEx') {
            return this.previousAction === this.action
        }
    }
}

// https://stackoverflow.com/a/60818105
const areEqual = (first, second) => first.length === second.length && first.every((value, index) => value === second[index]);

// const colorThief = import("./plugins/launchpad-cider/color-thief.umd.js");
class LaunchpadPlugin {
    constructor() {
        this.userScript = async function userScript() {
            console.log('Loading Usersciript')

            function handleInDevices(name = 'LPProMK3 MIDI') {
                let in_dev;
                for (let input of midi.inputs.values()) {
                    if (input.name === name) {
                        in_dev = input
                    } else {
                        input.close()
                    }
                }
                return in_dev
            }

            function handleOutDevices(name = 'LPProMK3 MIDI', midiAccess) {
                let out_dev;
                for (let output of midi.outputs.values()) {
                    if (output.name === name) {
                        out_dev = output
                    } else {
                        output.close()
                    }
                }
                return out_dev
            }

            await sleep(1000)

            const midi = await navigator.requestMIDIAccess({sysex: true});
            let lp_in, lp_out, lp_daw_in, lp_daw_out;

            lp_out = handleOutDevices('LPProMK3 MIDI', midi)

            function handle_daw(message) {
                let note = new MidiNote(message)
                if (note.sysexEvent === 'Layout') {
                    if (note.sysex.layout === 'Custom' && note.sysex.page === 7) {
                        launchpad.initDefaultPage()
                    }
                }
            }


            let isFaderMoving = false
            let breakFader = false
            let isShift = false
            let minVelocity = 20

            async function handle_midi(message) {
                let note = new MidiNote(message)
                let mk = MusicKit.getInstance()
                if (!(note.action === 'Aftertouch' || note.action === 'Clock')) {
                    console.log(message)
                    console.log(note)
                    console.log(note.wasOn)
                }

                if (note.action === 'CC') {
                    if (note.channel === 0) {
                        // Note actions that are page independent
                        if (note.velocity === 127) {
                            if (note.number === 4) {
                                if (mk._mediaItemPlayback._volumeAtMute) {
                                    mk.unmute()
                                } else {
                                    mk.mute()
                                }
                            }
                            if (note.number === 10) {
                                // noinspection JSUnresolvedVariable,JSUnresolvedFunction
                                app.copyToClipboard('https://song.link/i/' + mk.nowPlayingItem.songId)
                            }
                            // Play button
                            if (note.number === 20) {
                                if (!mk.nowPlayingItem && mk.queueIsEmpty) {
                                    let res = playPage()
                                    res.startPlaying = true
                                    mk.setQueue(res)
                                }
                                if (mk.isPlaying) {
                                    mk.pause()
                                } else {
                                    mk.play()
                                }
                            }

                            if (note.number === 70) {
                                if (mk.volume - 0.01 > 0) mk.volume = mk.volume - 0.01
                            }
                            if (note.number === 80) {
                                if (mk.volume + 0.01 < 1) mk.volume = mk.volume + 0.01
                            }
                            if (note.number === 91) {
                                mk.skipToPreviousItem()
                            }
                            if (note.number === 92) {
                                mk.skipToNextItem()
                            }
                            // Set the page
                            if (note.number - 100 > 0) {
                                launchpad.page = note.number - 100
                            }
                        }
                        if (note.velocity === 0 && note.number === 90) {
                            isShift = false
                            launchpad.isShift = false
                            launchpad.clearPads()
                            launchpad.page = launchpad.page
                            await launchpad.setSongIndexColor()
                        } else if (note.velocity === 127 && note.number === 90) {
                            isShift = true
                            launchpad.isShift = true
                            launchpad.clearPads()
                            await launchpad.setSongIndexColor()
                            launchpad.nowPlayingToMidiOut()
                        }
                        if (note.velocity === 0 && note.number === 60) {
                            launchpad.deleteMode = false
                        } else if (note.velocity === 127 && note.number === 60) {
                            launchpad.deleteMode = true
                        }
                        if (note.velocity === 127 && !launchpad.isShift) {
                            // Handle right side buttons
                            if (note.number % 10 === 9 && launchpad.page === 1) {
                                let valueIndex = "Item index " + note.number
                                // noinspection JSUnresolvedVariable,JSUnresolvedFunction,ES6RedundantAwait,JSCheckFunctionSignatures
                                let storedItem = await launchpad.storageClass.getValue(valueIndex)
                                if (storedItem) {
                                    if (launchpad.playNext) {
                                        mk.playNext(storedItem)
                                    } else {
                                        mk.playLater(storedItem)
                                    }
                                }
                            }
                            if (note.number % 10 === 9 && launchpad.page === 8) {
                                let valueIndex = "Item index " + note.number
                                // noinspection JSUnresolvedVariable,JSUnresolvedFunction,ES6RedundantAwait,JSCheckFunctionSignatures
                                await launchpad.storageClass.deleteValue(valueIndex)
                                launchpad.outputDevice.send(launchpad.makeSysexMessage(new LaunchpadColorSysexMessage([new LaunchpadStaticColor(note.number, 0)]).sysexMessage))
                            }
                        }
                        if (note.velocity === 127 && launchpad.isShift) {
                            console.log("Shift function")
                            if (note.number % 10 === 9) {
                                let valueIndex = "Item index " + note.number
                                console.log('Setting Value ' + valueIndex)
                                // noinspection JSUnresolvedVariable,JSUnresolvedFunction
                                launchpad.storageClass.setValue(valueIndex, playPage())
                            }
                        }
                    }

                }

                // if (message.data[0] === 177 && message.data[1] === 14) {
                //     mk.volume = message.data[2] / 127;
                // }
                if (!note.wasOn) {
                    if (note.action === 'NoteOn') {
                        if (note.channel === 0) {
                            switch (launchpad.page) {
                                case 1:
                                    if (launchpad.isShift) {

                                    } else {
                                        // TODO: Make this dynamic
                                        if (playPauseBox.includes(note.number) && note.velocity > minVelocity) {
                                            if (!mk.nowPlayingItem && mk.queueIsEmpty) {
                                                let res = playPage()
                                                res.startPlaying = true
                                                mk.setQueue(res)
                                            }
                                            if (mk.isPlaying) {
                                                mk.pause()
                                            } else {
                                                mk.play()
                                            }
                                        }
                                        if (repeatBox.includes(note.number) && note.velocity > minVelocity) {
                                            if (mk.repeatMode !== 2) {
                                                mk.repeatMode += 1
                                            } else {
                                                mk.repeatMode = 0
                                            }
                                        }
                                        if (autoplayBox.includes(note.number) && note.velocity > minVelocity) {
                                            mk.autoplayEnabled = !mk.autoplayEnabled
                                        }
                                        if (shuffleBox.includes(note.number)) {
                                            if (mk.shuffleMode === 1) {
                                                mk.shuffleMode = 0
                                            } else {
                                                mk.shuffleMode = 1
                                            }
                                        }
                                        if (letterBox.includes(note.number) && note.velocity > minVelocity) {
                                            launchpad.playNext = !launchpad.playNext
                                            launchpad.setPlayNextIndicator()
                                        }
                                        if (note.number % 10 === 4 && !isFaderMoving) {
                                            let pad_location = Math.floor(note.number * 0.1)
                                            let midi_equivalent = Math.round(mk.volume * 128)
                                            let targetVolume = pad_location * 16
                                            console.log(targetVolume)
                                            console.log(Math.floor((-note.velocity + 128) * faderMultiplier))
                                            isFaderMoving = true
                                            if (targetVolume > midi_equivalent) {
                                                for (let i = midi_equivalent; i <= targetVolume; i++) {
                                                    mk.volume = i / 128
                                                    // Sleep based on the velocity
                                                    await sleep(Math.floor((-note.velocity + 128) * faderMultiplier))
                                                    // If in the process of fading break
                                                    if (breakFader) {
                                                        break
                                                    }
                                                }
                                            } else if (targetVolume < midi_equivalent) {
                                                for (let i = midi_equivalent; i >= targetVolume; i--) {
                                                    mk.volume = i / 128
                                                    await sleep(Math.floor((-note.velocity + 128) * faderMultiplier))
                                                    // If in the process of fading break
                                                    if (breakFader) {
                                                        break
                                                    }
                                                }
                                            }
                                            isFaderMoving = false
                                            breakFader = false
                                        } else {
                                            // If in the process of fading break
                                            breakFader = true
                                        }
                                    }
                                    break

                                case 2:
                                    if (note.velocity > 10 && note.velocity < 40) {
                                        let songData = mk.nowPlayingItem.attributes
                                        let notification = new Notification(`${songData.name} by ${songData.artistName}`, {
                                            silent: true,
                                            icon: songData.artwork.url.replace('{w}', songData.artwork.width).replace('{h}', songData.artwork.height)
                                        })
                                        await sleep(2000)
                                        notification.close()
                                    } else {
                                        if (centerBox.includes(note.number)) {
                                            if (!mk.nowPlayingItem && mk.queueIsEmpty) {
                                                let res = playPage()
                                                res.startPlaying = true
                                                mk.setQueue(res)
                                            }
                                            if (mk.isPlaying) {
                                                mk.pause()
                                            } else {
                                                mk.play()
                                            }
                                        } else if (note.number % 10 <= 4) {
                                            mk.skipToPreviousItem()
                                        } else if (note.number % 10 >= 5) {
                                            mk.skipToNextItem()
                                        }
                                    }
                                    break

                                case 3:
                                    let value_index = "Song index " + note.number
                                    // noinspection ES6RedundantAwait,JSUnresolvedVariable,JSCheckFunctionSignatures
                                    let storedItem = await launchpad.storageClass.getValue(value_index)
                                    if (storedItem) {
                                        if (note.velocity < 50 && !launchpad.deleteMode) {
                                            let song
                                            if (storedItem.item.song.includes('i.')) {
                                                song = await mk.api.v3.music(`/v1/me/library/songs/${storedItem.item.song}`)
                                            } else {
                                                song = await mk.api.v3.music(`/v1/catalog/{{storefrontId}}/songs/${storedItem.item.song}`)
                                            }
                                            let songData = song.data.data[0].attributes
                                            let notification = new Notification(`${songData.name} by ${songData.artistName}`, {
                                                body: value_index,
                                                silent: true,
                                                icon: songData.artwork.url.replace('{w}', songData.artwork.width).replace('{h}', songData.artwork.height)
                                            })
                                            await sleep(2000)
                                            notification.close()
                                            // GM.notification({ highlight: true, text: `${songData.name} by ${songData.artistName}`, icon: songData.artwork.url.replace('{w}', songData.artwork.width).replace('{h}', songData.artwork.height)})
                                        } else {
                                            if (launchpad.deleteMode) {
                                                launchpad.outputDevice.send(launchpad.makeSysexMessage(new LaunchpadColorSysexMessage([new LaunchpadStaticColor(note.number, 0)]).sysexMessage))
                                                await launchpad.storageClass.deleteValue(value_index)
                                            } else {
                                                if (launchpad.playNext) {
                                                    mk.playNext(storedItem.item)
                                                } else {
                                                    mk.playLater(storedItem.item)
                                                }
                                            }
                                        }
                                    } else {
                                        if (mk.nowPlayingItem && !launchpad.deleteMode) {
                                            let setVariable = {item: {}}
                                            setVariable['item'][mk.nowPlayingItem.type] = mk.nowPlayingItem.songId
                                            setVariable['rgb'] = launchpad.nowPlayingRGBValue
                                            launchpad.outputDevice.send(launchpad.makeSysexMessage(new LaunchpadColorSysexMessage([launchpad.nowPlayingRGBValue.copy(note.number)]).sysexMessage))
                                            await launchpad.storageClass.setValue(value_index, setVariable)
                                        }
                                    }
                                    break

                            }
                        }

                        // Legacy custom mode code
                        else if (note.channel === 2) {
                            if (note.number === 60 && note.velocity > 40) {
                                mk.skipToPreviousItem()
                            } else if (note.number === 61 && note.velocity > 40) {
                                mk.skipToNextItem()
                            } else if (note.number === 62 && note.velocity > 40) {
                                if (!mk.nowPlayingItem && mk.queueIsEmpty) {
                                    let res = playPage()
                                    res.startPlaying = true
                                    mk.setQueue(res)
                                }
                                if (mk.isPlaying) {
                                    mk.pause()
                                } else {
                                    mk.play()
                                }
                            }
                        }
                    }
                }
                if (note.action === 'ProgChange') {
                    if (note.channel === 0) {

                    }
                }
            }

            function handle_device_event(e) {
                // if (e.port.name === 'LPProMK3 MIDI' && e.port.state === 'connected' && e.port.type === 'output') {
                //     // lp_out = e.port
                //     initProgrammer(lp_out)
                // }
                // if (e.port.name === 'LPProMK3 MIDI' && e.port.state === 'connected' && e.port.type === 'input') {
                //     // lp = e.port
                //     lp.onmidimessage = handle_midi
                // }
                // if (e.port.name === "MIDIIN3 (LPProMK3 MIDI)" && e.port.state === 'connected' && e.port.type === 'input') {
                //     // lp_daw_in = e.port
                //     lp.onmidimessage = handle_daw
                // }

                console.log(e)
                // if (!lp || !lp_daw_in || !lp_out) {
                //     console.log(e)
                //     lp = handleInDevices()
                //     lp_out = handleOutDevices()
                //     // Enter programmer mode
                //     lp_out.send([240, 0, 32, 41, 2, 14, 14, 1, 247])
                //     // set top buttons
                //     lp_out.send([240, 0, 32, 41, 2, 14, 3, 3, 91, 127, 127, 127, 3, 92, 127, 127, 127, 3, 99, 127, 0, 0, 3, 10, 127, 127, 127, 247])
                //     lp_daw_in = handleInDevices("MIDIIN3 (LPProMK3 MIDI)")
                //     if (lp != null) {
                //         lp.onmidimessage = handle_midi
                //     }
                //     if (lp_daw_in != null) {
                //         lp_daw_in.onmidimessage = handle_daw
                //     }
                // }
            }


            lp_in = handleInDevices()
            lp_daw_in = handleInDevices("MIDIIN3 (LPProMK3 MIDI)")
            lp_daw_out = handleOutDevices('MIDIOUT3 (LPProMK3 MIDI)')

            let launchpad = new Launchpad(lp_in, lp_out, lp_daw_in, lp_daw_out)
            launchpad.initProgrammer()

            if (lp_in != null) {
                launchpad.inputDevice.onmidimessage = handle_midi
            }
            if (lp_daw_in != null) {
                lp_daw_in.onmidimessage = handle_daw
            }
            midi.addEventListener('statechange', e => handle_device_event(e))
            let mk = MusicKit.getInstance()
            await sleep(1000)
            launchpad.page = await launchpad.storageClass.getValue('page', 1)
            await launchpad.setSongIndexColor()
            exportValue('launchpad', launchpad)
            mk.addEventListener('playbackStateDidChange', function () {
                launchpad.setPlaybackIcon()
                launchpad.drawProgress()
                launchpad.nowPlayingToRGB()
            })
            mk.addEventListener('repeatModeDidChange', function () {
                launchpad.setRepeatIcon()
            })
            mk.addEventListener('queueIsReady', function () {
                console.log('queueIsReady')
            })
            mk.addEventListener('queueItemsDidChange', async function (e) {
                // Flash blue once when adding to queue
                let color = new LaunchpadStaticColor(20, 45)
                let drawLayout
                if (launchpad.playNext) {
                    drawLayout = largeLetterN
                } else {
                    drawLayout = largeLetterL
                }
                if (launchpad.page === 3) {
                    launchpad.drawLayout(drawLayout, 2, 2, 45)
                }
                launchpad.outputDevice.send(launchpad.makeSysexMessage(new LaunchpadColorSysexMessage([color]).sysexMessage))
                await sleep(500)
                // Trigger a page refresh
                if (launchpad.page === 3) {
                    launchpad.drawLayout(drawLayout, 2, 2, 0)
                    launchpad.page = launchpad.page
                }
                launchpad.setPlaybackIcon()
            })
            mk.addEventListener('queueItemForStartPosition', function () {
                console.log('queueItemForStartPosition')
                launchpad.nowPlayingToRGB()
            })
            mk.addEventListener('queuePositionDidChange', function () {
                console.log('queuePositionDidChange')
            })
            mk.addEventListener('playbackVolumeDidChange', function (e) {
                launchpad.setFader()
            })
            mk.addEventListener('playbackProgressDidChange', async function (e) {
                launchpad.drawProgress()

            })
            mk.addEventListener('bufferedProgressDidChange', function (e) {
                console.log('bufferedProgressDidChange')
                console.log(e)
            })
            mk.addEventListener('autoplayEnabledDidChange', function () {
                launchpad.setAutoplay()
            })
            mk.addEventListener('shuffleModeDidChange', function () {
                launchpad.setShuffle()
            })
            mk.addEventListener('nowPlayingItemWillChange', async function (e) {
                console.log('Now Playing Will change')
                console.log(e)
                if (e.item) {
                    launchpad.nowPlayingToRGB(99, e.item.attributes.artwork.url)
                } else {
                    launchpad.nowPlayingToRGB()
                }
            })
            mk.addEventListener('nowPlayingItemDidChange', async function (e) {
                console.log('Now Playing changed')
                console.log(e)
                if (e.item) {
                    launchpad.nowPlayingToRGB(99, e.item.attributes.artwork.url)
                } else {
                    launchpad.nowPlayingToRGB()
                }

                let mk = MusicKit.getInstance()
                launchpad.nowPlayingInfo = await mk.api.v3.music(`/v1/catalog/us/songs/${e.item.songId}/audio-analysis?include=audio-analysis&extend=loudnessCurve%2Cfades&l=en-US`)
                if (launchpad.nowPlayingInfo.data.data[0].attributes.bpm.main) {
                    launchpad.bpm = launchpad.nowPlayingInfo.data.data[0].attributes.bpm.main
                    await sleep(250)
                    let color = new LaunchpadFlashingColor(40, 45, 0)
                    launchpad.outputDevice.send(launchpad.makeSysexMessage(new LaunchpadColorSysexMessage([color]).sysexMessage))
                }
                if (launchpad.bpmInterval) {
                    clearInterval(launchpad.bpmInterval)
                    launchpad.bpmInterval = null
                }
                if (launchpad.nowPlayingInfo.data.data[0].attributes.beats.beatsInMilliseconds) {
                    if (!launchpad.bpmInterval) {
                        launchpad.bpmInterval = setInterval(function beatHandler(outDev) {
                            let currentMilliseconds = Math.floor(launchpad.mk.currentPlaybackTime * 1000)
                            if (launchpad.nowPlayingInfo.data.data[0].attributes.beats.beatsInMilliseconds.map(e => {
                                return e - e % 5
                            }).includes(currentMilliseconds - currentMilliseconds % 5 )) {
                                console.log(`Match at ${currentMilliseconds}`)
                                let msg = launchpad.makeSysexMessage(new LaunchpadColorSysexMessage([new LaunchpadStaticColor(10, 10)]).sysexMessage)
                                outDev.send(msg, performance.now())
                                msg = launchpad.makeSysexMessage(new LaunchpadColorSysexMessage([new LaunchpadStaticColor(10, 0)]).sysexMessage)
                                outDev.send(msg, performance.now() + 40)
                            }
                        }, 20, launchpad.outputDevice)
                    }
                }
                launchpad.drawProgress()
                if (mk.capabilities.canSkipToNextItem) {
                    launchpad.outputDevice.send(launchpad.makeSysexMessage(new LaunchpadColorSysexMessage([new LaunchpadStaticColor(92, 3)]).sysexMessage))
                } else {
                    launchpad.outputDevice.send(launchpad.makeSysexMessage(new LaunchpadColorSysexMessage([new LaunchpadStaticColor(92, 0)]).sysexMessage))
                }
                if (mk.capabilities.canSkipToPreviousItem) {
                    launchpad.outputDevice.send(launchpad.makeSysexMessage(new LaunchpadColorSysexMessage([new LaunchpadStaticColor(91, 3)]).sysexMessage))
                } else {
                    launchpad.outputDevice.send(launchpad.makeSysexMessage(new LaunchpadColorSysexMessage([new LaunchpadStaticColor(91, 0)]).sysexMessage))
                }
            })


            // unsafeWindow.colorWheelTimer = setInterval(() => {
            //     launchpad.colorWheel()
            // }, 50)
        }

        document.addEventListener('musickitloaded', async function () {
            await this.userScript()
        })
    }
}


const lp = new LaunchpadPlugin()

lp.userScript()