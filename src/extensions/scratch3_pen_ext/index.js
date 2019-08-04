const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const Clone = require('../../util/clone');
const Color = require('../../util/color');
const formatMessage = require('format-message');
const MathUtil = require('../../util/math-util');
const RenderedTarget = require('../../sprites/rendered-target');
const log = require('../../util/log');
const StageLayering = require('../../engine/stage-layering');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgeG1sbnM6ZGM9Imh0dHA6Ly9wdXJsLm9yZy9kYy9lbGVtZW50cy8xLjEvIgogICB4bWxuczpjYz0iaHR0cDovL2NyZWF0aXZlY29tbW9ucy5vcmcvbnMjIgogICB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICAgeG1sbnM6c29kaXBvZGk9Imh0dHA6Ly9zb2RpcG9kaS5zb3VyY2Vmb3JnZS5uZXQvRFREL3NvZGlwb2RpLTAuZHRkIgogICB4bWxuczppbmtzY2FwZT0iaHR0cDovL3d3dy5pbmtzY2FwZS5vcmcvbmFtZXNwYWNlcy9pbmtzY2FwZSIKICAgd2lkdGg9IjQwIgogICBoZWlnaHQ9IjQwIgogICB2aWV3Qm94PSIwIDAgNDAgNDAiCiAgIHZlcnNpb249IjEuMSIKICAgaWQ9InN2ZzE2IgogICBzb2RpcG9kaTpkb2NuYW1lPSJwZW4tc21hbGwuc3ZnIgogICBpbmtzY2FwZTp2ZXJzaW9uPSIwLjkyLjQgKHVua25vd24pIj4KICA8bWV0YWRhdGEKICAgICBpZD0ibWV0YWRhdGEyMiI+CiAgICA8cmRmOlJERj4KICAgICAgPGNjOldvcmsKICAgICAgICAgcmRmOmFib3V0PSIiPgogICAgICAgIDxkYzpmb3JtYXQ+aW1hZ2Uvc3ZnK3htbDwvZGM6Zm9ybWF0PgogICAgICAgIDxkYzp0eXBlCiAgICAgICAgICAgcmRmOnJlc291cmNlPSJodHRwOi8vcHVybC5vcmcvZGMvZGNtaXR5cGUvU3RpbGxJbWFnZSIgLz4KICAgICAgPC9jYzpXb3JrPgogICAgPC9yZGY6UkRGPgogIDwvbWV0YWRhdGE+CiAgPGRlZnMKICAgICBpZD0iZGVmczIwIiAvPgogIDxzb2RpcG9kaTpuYW1lZHZpZXcKICAgICBwYWdlY29sb3I9IiNmZmZmZmYiCiAgICAgYm9yZGVyY29sb3I9IiM2NjY2NjYiCiAgICAgYm9yZGVyb3BhY2l0eT0iMSIKICAgICBvYmplY3R0b2xlcmFuY2U9IjEwIgogICAgIGdyaWR0b2xlcmFuY2U9IjEwIgogICAgIGd1aWRldG9sZXJhbmNlPSIxMCIKICAgICBpbmtzY2FwZTpwYWdlb3BhY2l0eT0iMCIKICAgICBpbmtzY2FwZTpwYWdlc2hhZG93PSIyIgogICAgIGlua3NjYXBlOndpbmRvdy13aWR0aD0iMTkyMCIKICAgICBpbmtzY2FwZTp3aW5kb3ctaGVpZ2h0PSIxMTUwIgogICAgIGlkPSJuYW1lZHZpZXcxOCIKICAgICBzaG93Z3JpZD0iZmFsc2UiCiAgICAgaW5rc2NhcGU6em9vbT0iNS45IgogICAgIGlua3NjYXBlOmN4PSItMTAuNzYyNzEyIgogICAgIGlua3NjYXBlOmN5PSIyMCIKICAgICBpbmtzY2FwZTp3aW5kb3cteD0iMCIKICAgICBpbmtzY2FwZTp3aW5kb3cteT0iMjUiCiAgICAgaW5rc2NhcGU6d2luZG93LW1heGltaXplZD0iMSIKICAgICBpbmtzY2FwZTpjdXJyZW50LWxheWVyPSJzdmcxNiIgLz4KICA8dGl0bGUKICAgICBpZD0idGl0bGUyIj5wZW4taWNvbjwvdGl0bGU+CiAgPGcKICAgICBzdHJva2U9IiM1NzVFNzUiCiAgICAgZmlsbD0ibm9uZSIKICAgICBmaWxsLXJ1bGU9ImV2ZW5vZGQiCiAgICAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogICAgIHN0cm9rZS1saW5lam9pbj0icm91bmQiCiAgICAgaWQ9ImcxNCI+CiAgICA8cGF0aAogICAgICAgZD0iTTguNzUzIDM0LjYwMmwtNC4yNSAxLjc4IDEuNzgzLTQuMjM3YzEuMjE4LTIuODkyIDIuOTA3LTUuNDIzIDUuMDMtNy41MzhMMzEuMDY2IDQuOTNjLjg0Ni0uODQyIDIuNjUtLjQxIDQuMDMyLjk2NyAxLjM4IDEuMzc1IDEuODE2IDMuMTczLjk3IDQuMDE1TDE2LjMxOCAyOS41OWMtMi4xMjMgMi4xMTYtNC42NjQgMy44LTcuNTY1IDUuMDEyIgogICAgICAgZmlsbD0iI0ZGRiIKICAgICAgIGlkPSJwYXRoNCIgLz4KICAgIDxwYXRoCiAgICAgICBkPSJNMjkuNDEgNi4xMXMtNC40NS0yLjM3OC04LjIwMiA1Ljc3MmMtMS43MzQgMy43NjYtNC4zNSAxLjU0Ni00LjM1IDEuNTQ2IgogICAgICAgaWQ9InBhdGg2IiAvPgogICAgPHBhdGgKICAgICAgIGQ9Ik0zNi40MiA4LjgyNWMwIC40NjMtLjE0Ljg3My0uNDMyIDEuMTY0bC05LjMzNSA5LjNjLjI4Mi0uMjkuNDEtLjY2OC40MS0xLjEyIDAtLjg3NC0uNTA3LTEuOTYzLTEuNDA2LTIuODY4LTEuMzYyLTEuMzU4LTMuMTQ3LTEuOC00LjAwMi0uOTlMMzAuOTkgNS4wMWMuODQ0LS44NCAyLjY1LS40MSA0LjAzNS45Ni44OTguOTA0IDEuMzk2IDEuOTgyIDEuMzk2IDIuODU1TTEwLjUxNSAzMy43NzRjLS41NzMuMzAyLTEuMTU3LjU3LTEuNzY0LjgzTDQuNSAzNi4zODJsMS43ODYtNC4yMzVjLjI1OC0uNjA0LjUzLTEuMTg2LjgzMy0xLjc1Ny42OS4xODMgMS40NDguNjI1IDIuMTA4IDEuMjgyLjY2LjY1OCAxLjEwMiAxLjQxMiAxLjI4NyAyLjEwMiIKICAgICAgIGZpbGw9IiM0Qzk3RkYiCiAgICAgICBpZD0icGF0aDgiIC8+CiAgICA8cGF0aAogICAgICAgZD0iTTM2LjQ5OCA4Ljc0OGMwIC40NjQtLjE0Ljg3NC0uNDMzIDEuMTY1bC0xOS43NDIgMTkuNjhjLTIuMTMgMi4xMS00LjY3MyAzLjc5My03LjU3MiA1LjAxTDQuNSAzNi4zOGwuOTc0LTIuMzE2IDEuOTI1LS44MDhjMi44OTgtMS4yMTggNS40NC0yLjkgNy41Ny01LjAxbDE5Ljc0My0xOS42OGMuMjkyLS4yOTIuNDMyLS43MDIuNDMyLTEuMTY1IDAtLjY0Ni0uMjctMS40LS43OC0yLjEyMi4yNS4xNzIuNS4zNzcuNzM3LjYxNC44OTguOTA1IDEuMzk2IDEuOTgzIDEuMzk2IDIuODU2IgogICAgICAgZmlsbD0iIzU3NUU3NSIKICAgICAgIG9wYWNpdHk9Ii4xNSIKICAgICAgIGlkPSJwYXRoMTAiIC8+CiAgICA8cGF0aAogICAgICAgZD0iTTE4LjQ1IDEyLjgzYzAgLjUtLjQwNC45MDUtLjkwNC45MDVzLS45MDUtLjQwNS0uOTA1LS45MDRjMC0uNS40MDctLjkwMy45MDYtLjkwMy41IDAgLjkwNC40MDQuOTA0LjkwNHoiCiAgICAgICBmaWxsPSIjNTc1RTc1IgogICAgICAgaWQ9InBhdGgxMiIgLz4KICA8L2c+CiAgPHBhdGgKICAgICBzdHlsZT0iZmlsbDojZmY2NjAwO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDowO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lIgogICAgIGQ9Im0gMjYuNDA5MzE2LDE1LjMwNjg3NSBjIC0wLjM0NDA2MywtMC41MjUxMDcgLTIuMjAwMjYsLTEuNzgxNDUxIC0yLjYzMjAyLC0xLjc4MTQ1MSAtMC4xNzU4MTgsMCAtMC4zMTk2NjksLTAuMDU3OCAtMC4zMTk2NjksLTAuMTI4NDQzIDAsLTAuMDcwNjQgMS44MTIwMjUsLTEuOTM5Mjg4IDQuMDI2NzIxLC00LjE1MjU0MjUgMy44NTc3MTQsLTMuODU1MjAxOSA0LjA1NDA0NywtNC4wMjQwOTk1IDQuNjc3Nzc1LC00LjAyNDA5OTUgMS40MDMyNTUsMCAyLjQ4MTk0NSwwLjkxMjkxMjggMi40ODE5NDUsMi4xMDA1MTA1IDAsMC42ODU0MzY5IC0wLjA3NDExLDAuNzcyOTE2MyAtMy44NTcyODUsNC41NTM0MTM1IC0yLjEyMTUwNywyLjEyMDAwMyAtMy45MTIxMjIsMy44NTQ1NTEgLTMuOTc5MTQ0LDMuODU0NTUxIC0wLjA2NzAyLDAgLTAuMjQ2MjY3LC0wLjE4OTg3MyAtMC4zOTgzMjMsLTAuNDIxOTM5IHoiCiAgICAgaWQ9InBhdGgyNCIKICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIiAvPgogIDxwYXRoCiAgICAgc3R5bGU9ImZpbGw6I2ZmNjYwMDtmaWxsLW9wYWNpdHk6MTtzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6MC4xNjk0OTE1MyIKICAgICBkPSJtIDI3LjI0NjY4MSwxNi43NTM0NzMgLTAuMzYzNDg4LC0wLjgyMzkwMSAzLjcyMzY4OSwtMy43MDIwNzQgYyAyLjA0ODAyOCwtMi4wMzYxNDEgMy44NDA0MjQsLTMuOTIzNjI1OCAzLjk4MzEwMiwtNC4xOTQ0MTExIDAuMTU4OTc2LC0wLjMwMTcxNzggMC4yMjM3OTEsLTAuNzExODU3NyAwLjE2NzQwNSwtMS4wNTkzMjIxIC0wLjA1MDYxLC0wLjMxMTg0MTggLTAuMDYwMjEsLTAuNTY2OTg1MSAtMC4wMjEzNSwtMC41NjY5ODUxIDAuMDM4ODYsMCAwLjMwMDMwMiwwLjQwMDQyMzcgMC41ODA5NzQsMC44ODk4MzA1IDAuOTcwNDAzLDEuNjkyMDg4NCAxLjA2NjMyNSwxLjUyNzI3MzkgLTMuNTk2Njc2LDYuMTc5ODE0OCBsIC00LjExMDE3LDQuMTAwOTQ5IHoiCiAgICAgaWQ9InBhdGgyNiIKICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIiAvPgogIDxwYXRoCiAgICAgc3R5bGU9ImZpbGw6I2Q0NTUwMDtmaWxsLW9wYWNpdHk6MTtzdHJva2U6IzAwMDAwMDtzdHJva2Utd2lkdGg6MDtzdHJva2UtbWl0ZXJsaW1pdDo0O3N0cm9rZS1kYXNoYXJyYXk6bm9uZSIKICAgICBkPSJtIDUuNjYxMDE2OSwzNS4xMzg5NDkgYyAwLC0wLjA0NDc2IDAuMTk3OTE5MSwtMC41NjMzMzIgMC40Mzk4MjAxLC0xLjE1MjM3MyAwLjQxMzEyMjQsLTEuMDA1OTczIDAuNDg5ODAxNSwtMS4wODg3MzUgMS4yNjMyMjEsLTEuMzYzNDI5IDAuNDUyODcwMywtMC4xNjA4NDUgMC45Mzg4MjU5LC0wLjQwNzg3MSAxLjA3OTkwMTMsLTAuNTQ4OTQ2IDAuMjI5MDA2MywtMC4yMjkwMDcgMC4zMTIwMjk1LC0wLjE3OTg0NSAwLjc3NDU0NTEsMC40NTg2MzkgMC4yODQ5MjQ2LDAuMzkzMzI3IDAuNDkxNjk2NiwwLjc5NjYzMiAwLjQ1OTQ5MzYsMC44OTYyMzUgLTAuMDMyMjAzLDAuMDk5NiAtMC44OTE5OTQ2LDAuNTQxMDIzIC0xLjkxMDY0NzUsMC45ODA5MzUgLTEuODM1NDYsMC43OTI2NTUgLTIuMTA2MzMzNiwwLjg4NjM5NyAtMi4xMDYzMzM2LDAuNzI4OTM5IHoiCiAgICAgaWQ9InBhdGgyOCIKICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIiAvPgogIDxwYXRoCiAgICAgc3R5bGU9ImZpbGw6I2Q0NTUwMDtmaWxsLW9wYWNpdHk6MTtzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6MDtzdHJva2UtbWl0ZXJsaW1pdDo0O3N0cm9rZS1kYXNoYXJyYXk6bm9uZSIKICAgICBkPSJtIDI3LjMzODcyOCwxNi42MTc3OCAtMC4yNzE0NDIsLTAuNjM0NzI5IDMuNzcxNTU5LC0zLjgxMzU1OSBjIDIuMjkxNTE2LC0yLjMxNzAzNDUgMy44NjY4NzIsLTQuMDQ2MzUyNiA0LjAxNDQ0MywtNC40MDY3ODAxIGwgMC4yNDI4ODMsLTAuNTkzMjIwNCAwLjI4MjQyMywwLjU0MjQzMDYgYyAwLjQzNTQxNSwwLjgzNjI3MjEgMC4zNDk0MjgsMS4yODAzMzM3IC0wLjQyMzY3MSwyLjE4Nzk0NCAtMC44MTgxODYsMC45NjA1NDE5IC03LjEyOTcxOCw3LjM1NDc5MzkgLTcuMjU4Mzc4LDcuMzUzNTA2OSAtMC4wNDc1MSwtNC43NGUtNCAtMC4yMDg1MjQsLTAuMjg2NDkyIC0wLjM1NzgxNywtMC42MzU1OTMgeiIKICAgICBpZD0icGF0aDMwIgogICAgIGlua3NjYXBlOmNvbm5lY3Rvci1jdXJ2YXR1cmU9IjAiIC8+CiAgPHBhdGgKICAgICBzdHlsZT0iZmlsbDojZDQ1NTAwO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTojMDAwMDAwO3N0cm9rZS13aWR0aDowO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lIgogICAgIGQ9Im0gNi45Mzg3Njk2LDMyLjA0MjM3MyBjIDAuMTQ1OTQ0LC0wLjM0OTU3NiAwLjMzMDc2NjgsLTAuNzAxMTcyIDAuNDEwNzE3MywtMC43ODEzMjQgMC4xODA5MjgyLC0wLjE4MTM4NCAxLjIxMDI1NzMsMC40MDQyMyAxLjA4MDI1MDksMC42MTQ1ODUgLTAuMDgyMTc1LDAuMTMyOTYyIC0xLjQ4NjU2MjksMC44MDIzMzIgLTEuNjgzMzUyMywwLjgwMjMzMiAtMC4wNDAxMzMsMCAwLjA0NjQ0LC0wLjI4NjAxNyAwLjE5MjM4NDEsLTAuNjM1NTkzIHoiCiAgICAgaWQ9InBhdGgzMiIKICAgICBpbmtzY2FwZTpjb25uZWN0b3ItY3VydmF0dXJlPSIwIiAvPgogIDxyZWN0CiAgICAgc3R5bGU9ImZpbGw6IzAwMDBmZjtmaWxsLW9wYWNpdHk6MTtzdHJva2U6bm9uZTtzdHJva2Utd2lkdGg6MDtzdHJva2UtbWl0ZXJsaW1pdDo0O3N0cm9rZS1kYXNoYXJyYXk6bm9uZSIKICAgICBpZD0icmVjdDQ1NDIiCiAgICAgd2lkdGg9IjIuODgxMzU2IgogICAgIGhlaWdodD0iMTMuMzg5ODMxIgogICAgIHg9IjI4LjEzNTU5MyIKICAgICB5PSIyMy4zODk4MyIKICAgICByeT0iMS40NDA2NzgiIC8+CiAgPHJlY3QKICAgICByeT0iMS40NDA2NzgiCiAgICAgeT0iLTM2LjI3MTE4NyIKICAgICB4PSIyOC42NDQwNjgiCiAgICAgaGVpZ2h0PSIxMy4zODk4MzEiCiAgICAgd2lkdGg9IjIuODgxMzU2IgogICAgIGlkPSJyZWN0NDU0NCIKICAgICBzdHlsZT0iZmlsbDojMDAwMGZmO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTpub25lO3N0cm9rZS13aWR0aDowO3N0cm9rZS1taXRlcmxpbWl0OjQ7c3Ryb2tlLWRhc2hhcnJheTpub25lIgogICAgIHRyYW5zZm9ybT0icm90YXRlKDkwKSIgLz4KPC9zdmc+Cg==';

/**
 * Enum for pen color parameter values.
 * @readonly
 * @enum {string}
 */
const ColorParam = {
    COLOR: 'color',
    SATURATION: 'saturation',
    BRIGHTNESS: 'brightness',
    TRANSPARENCY: 'transparency'
};

const FontParam = {
    HELVETICA: 'Helvetica',
    TIMES_NEW_ROMAN: '\'Times New Roman\'',
    COURIER_NEW: '\'Courier New\'',
    SERIF: 'serif',
    AUTUMN: '\'Autumn in November\'',
    SEGMENT_16C: 'Segment16C',
    DISPLAY_24: '\'Open 24 Display St\'',
    GENTIUM: 'Gentium',
    RIFFIC: 'Riffic',
    REPORT_1942: '\'1942 report\'',
    PURISA: 'Purisa',
    MY_FONT: '\'My type of font\''
};

/**
 * @typedef {object} PenState - the pen state associated with a particular target.
 * @property {Boolean} penDown - tracks whether the pen should draw for this target.
 * @property {number} color - the current color (hue) of the pen.
 * @property {PenAttributes} penAttributes - cached pen attributes for the renderer. This is the authoritative value for
 *   diameter but not for pen color.
 */


class Scratch3NewBlocks {

    // ********************************************************************************
    /**
     * The runtime instantiating this block package.
     * @type {Runtime}
     */
    constructor(runtime) {
        this.runtime = runtime;

        /**
         * The ID of the renderer Drawable corresponding to the pen layer.
         * @type {int}
         * @private
         */
        this._penDrawableId = -1;

        /**
         * The ID of the renderer Skin corresponding to the pen layer.
         * @type {int}
         * @private
         */
        this._penSkinId = -1;

        this._onTargetCreated = this._onTargetCreated.bind(this);
        this._onTargetMoved = this._onTargetMoved.bind(this);

        runtime.on('targetWasCreated', this._onTargetCreated);
        runtime.on('RUNTIME_DISPOSED', this.clear.bind(this));
    }

    /**
     * The default pen state, to be used when a target has no existing pen state.
     * @type {PenState}
     */
    static get DEFAULT_PEN_STATE() {
        return {
            penDown: false,
            color: 66.66,
            saturation: 100,
            brightness: 100,
            transparency: 0,
            _shade: 50, // Used only for legacy `change shade by` blocks
            drawableTextId: undefined,
            penAttributes: {
                color4f: [0, 0, 1, 1],
                diameter: 1
            },
            fontAttributes: {
                size: 14,
                font: 'helvetica'
            }
        };
    }


    /**
     * The minimum and maximum allowed pen size.
     * The maximum is twice the diagonal of the stage, so that even an
     * off-stage sprite can fill it.
     * @type {{min: number, max: number}}
     */
    static get PEN_SIZE_RANGE() {
        return {
            min: 1,
            max: 1200
        };
    }

    static get FONT_SIZE_RANGE() {
        return {
            min: 8,
            max: 72
        };
    }

    /**
     * The key to load & store a target's pen-related state.
     * @type {string}
     */
    static get STATE_KEY() {
        return 'Scratch.pen';
    }

    /**
     * Clamp a pen size value to the range allowed by the pen.
     * @param {number} requestedSize - the requested pen size.
     * @returns {number} the clamped size.
     * @private
     */
    _clampPenSize(requestedSize) {
        return MathUtil.clamp(
            requestedSize,
            Scratch3NewBlocks.PEN_SIZE_RANGE.min,
            Scratch3NewBlocks.PEN_SIZE_RANGE.max
        );
    }

    _clampFontSize(requestedSize) {
        return MathUtil.clamp(
            requestedSize,
            Scratch3NewBlocks.FONT_SIZE_RANGE.min,
            Scratch3NewBlocks.FONT_SIZE_RANGE.max
        );
    }

    /**
     * Retrieve the ID of the renderer "Skin" corresponding to the pen layer. If
     * the pen Skin doesn't yet exist, create it.
     * @returns {int} the Skin ID of the pen layer, or -1 on failure.
     * @private
     */
    _getPenLayerID() {
        if (this._penSkinId < 0 && this.runtime.renderer) {
            this._penSkinId = this.runtime.renderer.createPenSkin();
            this._penDrawableId = this.runtime.renderer.createDrawable(StageLayering.PEN_LAYER);
            this.runtime.renderer.updateDrawableProperties(this._penDrawableId, {
                skinId: this._penSkinId
            });
        }
        return this._penSkinId;
    }

    /**
     * @param {Target} target - collect pen state for this target. Probably, but not necessarily, a RenderedTarget.
     * @returns {PenState} the mutable pen state associated with that target. This will be created if necessary.
     * @private
     */
    _getPenState(target) {
        let penState = target.getCustomState(Scratch3NewBlocks.STATE_KEY);
        if (!penState) {
            penState = Clone.simple(Scratch3NewBlocks.DEFAULT_PEN_STATE);
            target.setCustomState(Scratch3NewBlocks.STATE_KEY, penState);
        }
        return penState;
    }

    /**
     * When a pen-using Target is cloned, clone the pen state.
     * @param {Target} newTarget - the newly created target.
     * @param {Target} [sourceTarget] - the target used as a source for the new clone, if any.
     * @listens Runtime#event:targetWasCreated
     * @private
     */
    _onTargetCreated(newTarget, sourceTarget) {
        if (sourceTarget) {
            const penState = sourceTarget.getCustomState(Scratch3NewBlocks.STATE_KEY);
            if (penState) {
                newTarget.setCustomState(Scratch3NewBlocks.STATE_KEY, Clone.simple(penState));
                if (penState.penDown) {
                    newTarget.addListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
                }
            }
        }
    }

    /**
     * Handle a target which has moved. This only fires when the pen is down.
     * @param {RenderedTarget} target - the target which has moved.
     * @param {number} oldX - the previous X position.
     * @param {number} oldY - the previous Y position.
     * @param {boolean} isForce - whether the movement was forced.
     * @private
     */
    _onTargetMoved(target, oldX, oldY, isForce) {
        // Only move the pen if the movement isn't forced (ie. dragged).
        if (!isForce) {
            const penSkinId = this._getPenLayerID();
            if (penSkinId >= 0) {
                const penState = this._getPenState(target);
                this.runtime.renderer.penLine(penSkinId, penState.penAttributes, oldX, oldY, target.x, target.y);
                this.runtime.requestRedraw();
            }
        }
    }

    /**
     * Wrap a color input into the range (0,100).
     * @param {number} value - the value to be wrapped.
     * @returns {number} the wrapped value.
     * @private
     */
    _wrapColor(value) {
        return MathUtil.wrapClamp(value, 0, 100);
    }

    /**
     * Initialize color parameters menu with localized strings
     * @returns {array} of the localized text and values for each menu element
     * @private
     */
    _initColorParam() {
        return [{
                text: formatMessage({
                    id: 'pen.colorMenu.color',
                    default: 'color',
                    description: 'label for color element in color picker for pen extension'
                }),
                value: ColorParam.COLOR
            },
            {
                text: formatMessage({
                    id: 'pen.colorMenu.saturation',
                    default: 'saturation',
                    description: 'label for saturation element in color picker for pen extension'
                }),
                value: ColorParam.SATURATION
            },
            {
                text: formatMessage({
                    id: 'pen.colorMenu.brightness',
                    default: 'brightness',
                    description: 'label for brightness element in color picker for pen extension'
                }),
                value: ColorParam.BRIGHTNESS
            },
            {
                text: formatMessage({
                    id: 'pen.colorMenu.transparency',
                    default: 'transparency',
                    description: 'label for transparency element in color picker for pen extension'
                }),
                value: ColorParam.TRANSPARENCY

            }
        ];
    }

    _supportedFonts() {
        return [{
                text: formatMessage({
                    id: 'pen.fontMenu.font1',
                    default: 'Helvetica',
                    description: 'Helvetica font'
                }),
                value: FontParam.HELVETICA
            },
            {
                text: formatMessage({
                    id: 'pen.fontMenu.font2',
                    default: 'Times New Roman',
                    description: 'Times New Roman font'
                }),
                value: FontParam.TIMES_NEW_ROMAN
            },
            {
                text: formatMessage({
                    id: 'pen.fontMenu.font3',
                    default: 'Courier New',
                    description: 'Courier New font'
                }),
                value: FontParam.COURIER_NEW
            },
            {
                text: formatMessage({
                    id: 'pen.fontMenu.font4',
                    default: 'serif',
                    description: 'Serif font'
                }),
                value: FontParam.SERIF

            },
            {
                text: formatMessage({
                    id: 'pen.fontMenu.font5',
                    default: 'Autumn in November',
                    description: 'Autumn in November font'
                }),
                value: FontParam.AUTUMN

            },
            {
                text: formatMessage({
                    id: 'pen.fontMenu.font6',
                    default: 'Gentium',
                    description: 'Gentium font'
                }),
                value: FontParam.GENTIUM

            },
            {
                text: formatMessage({
                    id: 'pen.fontMenu.font7',
                    default: 'Open 24 Display St',
                    description: 'Open 24 Display St font'
                }),
                value: FontParam.DISPLAY_24
            },
            {
                text: formatMessage({
                    id: 'pen.fontMenu.font8',
                    default: 'Segment16C',
                    description: 'Segment16C font'
                }),
                value: FontParam.SEGMENT_16C
            },
            {
                text: formatMessage({
                    id: 'pen.fontMenu.font9',
                    default: 'Riffic',
                    description: 'Riffic font'
                }),
                value: FontParam.RIFFIC
            },
            {
                text: formatMessage({
                    id: 'pen.fontMenu.font10',
                    default: 'My type of font',
                    description: 'My typefont'
                }),
                value: FontParam.MY_FONT
            },
            {
                text: formatMessage({
                    id: 'pen.fontMenu.font11',
                    default: '1942 report',
                    description: '1942 report font'
                }),
                value: FontParam.REPORT_1942
            },
            {
                text: formatMessage({
                    id: 'pen.fontMenu.font12',
                    default: 'Purisa',
                    description: 'Purisa font'
                }),
                value: FontParam.PURISA
            }



        ];
    }

    _initIsUpdatableOptions() {
        return [{
                text: formatMessage({
                    id: 'pen.isUpdatableMenu.true',
                    default: 'true',
                }),
                value: true
            },
            {
                text: formatMessage({
                    id: 'pen.isUpdatableMenu.false',
                    default: 'false',
                }),
                value: false
            }
        ];
    }

    /**
     * Clamp a pen color parameter to the range (0,100).
     * @param {number} value - the value to be clamped.
     * @returns {number} the clamped value.
     * @private
     */
    _clampColorParam(value) {
        return MathUtil.clamp(value, 0, 100);
    }

    /**
     * Convert an alpha value to a pen transparency value.
     * Alpha ranges from 0 to 1, where 0 is transparent and 1 is opaque.
     * Transparency ranges from 0 to 100, where 0 is opaque and 100 is transparent.
     * @param {number} alpha - the input alpha value.
     * @returns {number} the transparency value.
     * @private
     */
    _alphaToTransparency(alpha) {
        return (1.0 - alpha) * 100.0;
    }

    /**
     * Convert a pen transparency value to an alpha value.
     * Alpha ranges from 0 to 1, where 0 is transparent and 1 is opaque.
     * Transparency ranges from 0 to 100, where 0 is opaque and 100 is transparent.
     * @param {number} transparency - the input transparency value.
     * @returns {number} the alpha value.
     * @private
     */
    _transparencyToAlpha(transparency) {
        return 1.0 - (transparency / 100.0);
    }

    writeLog(args) {
        const text = Cast.toString(args.TEXT);
        log.log(text);
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        return {
            id: 'newblocks',
            name: 'Pen Extended',
            blockIconURI: blockIconURI,
            blocks: [{
                    opcode: 'writeLog',
                    blockType: BlockType.COMMAND,
                    text: 'log [TEXT]',
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: "hello"
                        }
                    },
                    hideFromPalette: true
                },
                {
                    opcode: 'clear',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'pen.clear',
                        default: 'erase all',
                        description: 'erase all pen trails and stamps'
                    })
                },
                {
                    opcode: 'writeText',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'pen.write',
                        // default: 'write [TEXT] [IS_UPDATABLE]',
                        default: 'scrivi [TEXT] [IS_UPDATABLE]',
                        // description: 'write a text'
                        description: 'Scrive un testo'
                    }),
                    arguments: {
                        TEXT: {
                            id: "pen.write.default",
                            type: ArgumentType.STRING,
                            defaultValue: 'hello!'
                        },
                        IS_UPDATABLE: {
                            type: ArgumentType.STRING,
                            menu: 'isUpdatableOptions',
                            defaultValue: false
                        }
                    }
                },
                {
                    opcode: 'changeFontSizeBy',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'pen.changeFontSize',
                        // default: 'change font size by [SIZE]',
                        default: 'cambia dim. carattere di [SIZE]',
                        // description: 'change the Font size'
                        description: 'cambia la dimensione del carattere'
                    }),
                    arguments: {
                        SIZE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'setFontSizeTo',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'pen.setFontSize',
                        // default: 'set font size to [SIZE]',
                        default: 'imposta la dim. del carattere a [SIZE]',
                        // description: 'set the Font size'
                        description: 'imposta la dimensione del carattere'
                    }),
                    arguments: {
                        SIZE: {
                            type: ArgumentType.STRING,
                            defaultValue: 14
                        }
                    }
                },
                {
                    opcode: 'setFont',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'pen.setFont',
                        // default: 'set font to [FONT]',
                        default: 'usa il carattere [FONT]',
                        // description: 'set the Font'
                        description: 'imposta il carattere'
                    }),
                    arguments: {
                        FONT: {
                            type: ArgumentType.STRING,
                            menu: 'fonts',
                            defaultValue: 'Helvetica'
                        }
                    }
                },
                {
                    opcode: 'setFontUser',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'pen.setFontUser',
                        // default: 'set font to [FONT]',
                        default: 'usa il carattere [FONT]',
                        // description: 'set the Font'
                        description: 'imposta il carattere'
                    }),
                    arguments: {
                        FONT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Helvetica'
                        }
                    }
                },
                {
                    opcode: 'stamp',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'pen.stamp',
                        default: 'stamp',
                        description: 'render current costume on the background'
                    })
                },
                {
                    opcode: 'penDown',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'pen.penDown',
                        default: 'pen down',
                        description: 'start leaving a trail when the sprite moves'
                    })
                },
                {
                    opcode: 'penUp',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'pen.penUp',
                        default: 'pen up',
                        description: 'stop leaving a trail behind the sprite'
                    })
                },
                {
                    opcode: 'setPenColorToColor',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'pen.setColor',
                        default: 'set pen color to [COLOR]',
                        description: 'set the pen color to a particular (RGB) value'
                    }),
                    arguments: {
                        COLOR: {
                            type: ArgumentType.COLOR
                        }
                    }
                },
                {
                    opcode: 'changePenColorParamBy',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'pen.changeColorParam',
                        default: 'change pen [COLOR_PARAM] by [VALUE]',
                        description: 'change the state of a pen color parameter'
                    }),
                    arguments: {
                        COLOR_PARAM: {
                            type: ArgumentType.STRING,
                            menu: 'colorParam',
                            defaultValue: ColorParam.COLOR
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 10
                        }
                    }
                },
                {
                    opcode: 'setPenColorParamTo',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'pen.setColorParam',
                        default: 'set pen [COLOR_PARAM] to [VALUE]',
                        description: 'set the state for a pen color parameter e.g. saturation'
                    }),
                    arguments: {
                        COLOR_PARAM: {
                            type: ArgumentType.STRING,
                            menu: 'colorParam',
                            defaultValue: ColorParam.COLOR
                        },
                        VALUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        }
                    }
                },
                {
                    opcode: 'changePenSizeBy',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'pen.changeSize',
                        default: 'change pen size by [SIZE]',
                        description: 'change the diameter of the trail left by a sprite'
                    }),
                    arguments: {
                        SIZE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },
                {
                    opcode: 'setPenSizeTo',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'pen.setSize',
                        default: 'set pen size to [SIZE]',
                        description: 'set the diameter of a trail left by a sprite'
                    }),
                    arguments: {
                        SIZE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },
                /* Legacy blocks, should not be shown in flyout */
                {
                    opcode: 'setPenShadeToNumber',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'pen.setShade',
                        default: 'set pen shade to [SHADE]',
                        description: 'legacy pen blocks - set pen shade'
                    }),
                    arguments: {
                        SHADE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    },
                    hideFromPalette: true
                },
                {
                    opcode: 'changePenShadeBy',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'pen.changeShade',
                        default: 'change pen shade by [SHADE]',
                        description: 'legacy pen blocks - change pen shade'
                    }),
                    arguments: {
                        SHADE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    },
                    hideFromPalette: true
                },
                {
                    opcode: 'setPenHueToNumber',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'pen.setHue',
                        default: 'set pen color to [HUE]',
                        description: 'legacy pen blocks - set pen color to number'
                    }),
                    arguments: {
                        HUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    },
                    hideFromPalette: true
                },
                {
                    opcode: 'changePenHueBy',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'pen.changeHue',
                        default: 'change pen color by [HUE]',
                        description: 'legacy pen blocks - change pen color'
                    }),
                    arguments: {
                        HUE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    },
                    hideFromPalette: true
                }
            ],

            translation_map: {
                it: {
                    'writeText': 'Scrivi [TEXT] [IS_UPDATABLE]',
                    'writeText.TEXT_default': 'Ciao!',
                    'changeFontSizeBy': 'Porta la dimensione del font a [SIZE]',
                    'setFontSizeTo': 'Cambia la dimensione del font di [SIZE]',
                    'setFont': 'Imposta il carattere',
                }
            },

            menus: {
                colorParam: {
                    acceptReporters: true,
                    items: this._initColorParam()
                },
                fonts: {
                    acceptReporters: true,
                    items: this._supportedFonts()
                },
                isUpdatableOptions: {
                    acceptReporters: true,
                    items: this._initIsUpdatableOptions()
                }
            }
        };
    }

    /**
     * The pen "clear" block clears the pen layer's contents.
     */
    clear() {
        const penSkinId = this._getPenLayerID();
        if (penSkinId >= 0) {
            this.runtime.renderer.destroyAllTextDrawables("pen");
            this.runtime.renderer.penClear(penSkinId);
            this.runtime.requestRedraw();
        }
    }

    /**
     * The pen "stamp" block stamps the current drawable's image onto the pen layer.
     * @param {object} args - the block arguments.
     * @param {object} util - utility object provided by the runtime.
     */
    stamp(args, util) {
        const penSkinId = this._getPenLayerID();
        if (penSkinId >= 0) {
            const target = util.target;
            this.runtime.renderer.penStamp(penSkinId, target.drawableID);
            this.runtime.requestRedraw();
        }
    }

    /**
     * The pen "write" block write a text onto the pen layer.
     * @param {object} args - the block arguments.
     * @param {object} util - utility object provided by the runtime.
     */
    writeText(args, util) {
        const penSkinId = this._getPenLayerID();
        if (penSkinId >= 0) {
            const target = util.target;
            var position = [target.x, target.y];

            const penState = this._getPenState(target);
            let textId;
            let textSkinID;

            let text = args.TEXT + "";
            if (text && text.length > 0) {
                let color = penState.penAttributes.color4f;
                let colorHex = `rgba(${color[0] *255}, ${color[1]*255}, ${color[2]*255}, ${color[3]*255})` + "";

                if ((args.IS_UPDATABLE && args.IS_UPDATABLE == 'true') || args.IS_UPDATABLE == true) {
                    if (penState.drawableTextId && this.runtime.renderer.getDrawable(penState.drawableTextId)) {
                        textId = penState.drawableTextId;
                        textSkinID = penState.textSkinID;
                        textSkinID = this.runtime.renderer.updateTxtSkin(
                            textSkinID, text, colorHex, penState.fontAttributes.font, penState.fontAttributes.size
                        );
                    } else {
                        const newTextID = this.runtime.renderer.createDrawableText();
                        penState.drawableTextId = newTextID;
                        textId = newTextID;
                        textSkinID = this.runtime.renderer.createTxtSkin(
                            text, colorHex, penState.fontAttributes.font, penState.fontAttributes.size
                        );
                        penState.textSkinID = textSkinID;
                    }
                } else {
                    const newTextID = this.runtime.renderer.createDrawableText();
                    textId = newTextID;
                    textSkinID = this.runtime.renderer.createTxtSkin(
                        text, colorHex, penState.fontAttributes.font, penState.fontAttributes.size
                    );
                }
                this.runtime.renderer.penWrite(textId, textSkinID, position);

                this.runtime.requestRedraw();
            }
        }
    }

    /**
     * The pen "change font size by {number}" block changes the font size by the given amount.
     * @param {object} args - the block arguments.
     *  @property {number} SIZE - the amount of desired size change.
     * @param {object} util - utility object provided by the runtime.
     */
    changeFontSizeBy(args, util) {
        const fontAttributes = this._getPenState(util.target).fontAttributes;
        fontAttributes.size = this._clampFontSize(fontAttributes.size + Cast.toNumber(args.SIZE));
    }

    /**
     * The pen "set pen size to {number}" block sets the pen size to the given amount.
     * @param {object} args - the block arguments.
     *  @property {number} SIZE - the amount of desired size change.
     * @param {object} util - utility object provided by the runtime.
     */
    setFontSizeTo(args, util) {
        const fontAttributes = this._getPenState(util.target).fontAttributes;
        fontAttributes.size = this._clampFontSize(Cast.toNumber(args.SIZE));
    }

    setFont(args, util) {
        const fontAttributes = this._getPenState(util.target).fontAttributes;

        fontAttributes.font = args.FONT;
    }

    setFontUser(args, util) {
        const fontAttributes = this._getPenState(util.target).fontAttributes;

        fontAttributes.font = args.FONT;
    }

    /**
     * The pen "pen down" block causes the target to leave pen trails on future motion.
     * @param {object} args - the block arguments.
     * @param {object} util - utility object provided by the runtime.
     */
    penDown(args, util) {
        const target = util.target;
        const penState = this._getPenState(target);

        if (!penState.penDown) {
            penState.penDown = true;
            target.addListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
        }

        const penSkinId = this._getPenLayerID();
        if (penSkinId >= 0) {
            this.runtime.renderer.penPoint(penSkinId, penState.penAttributes, target.x, target.y);
            this.runtime.requestRedraw();
        }
    }

    /**
     * The pen "pen up" block stops the target from leaving pen trails.
     * @param {object} args - the block arguments.
     * @param {object} util - utility object provided by the runtime.
     */
    penUp(args, util) {
        const target = util.target;
        const penState = this._getPenState(target);

        if (penState.penDown) {
            penState.penDown = false;
            target.removeListener(RenderedTarget.EVENT_TARGET_MOVED, this._onTargetMoved);
        }
    }

    /**
     * The pen "set pen color to {color}" block sets the pen to a particular RGB color.
     * The transparency is reset to 0.
     * @param {object} args - the block arguments.
     *  @property {int} COLOR - the color to set, expressed as a 24-bit RGB value (0xRRGGBB).
     * @param {object} util - utility object provided by the runtime.
     */
    setPenColorToColor(args, util) {
        const penState = this._getPenState(util.target);
        const rgb = Cast.toRgbColorObject(args.COLOR);
        const hsv = Color.rgbToHsv(rgb);
        penState.color = (hsv.h / 360) * 100;
        penState.saturation = hsv.s * 100;
        penState.brightness = hsv.v * 100;
        if (rgb.hasOwnProperty('a')) {
            penState.transparency = 100 * (1 - (rgb.a / 255.0));
        } else {
            penState.transparency = 0;
        }

        // Set the legacy "shade" value the same way scratch 2 did.
        penState._shade = penState.brightness / 2;

        this._updatePenColor(penState);
    }

    /**
     * Update the cached color from the color, saturation, brightness and transparency values
     * in the provided PenState object.
     * @param {PenState} penState - the pen state to update.
     * @private
     */
    _updatePenColor(penState) {
        const rgb = Color.hsvToRgb({
            h: penState.color * 360 / 100,
            s: penState.saturation / 100,
            v: penState.brightness / 100
        });
        penState.penAttributes.color4f[0] = rgb.r / 255.0;
        penState.penAttributes.color4f[1] = rgb.g / 255.0;
        penState.penAttributes.color4f[2] = rgb.b / 255.0;
        penState.penAttributes.color4f[3] = this._transparencyToAlpha(penState.transparency);
    }

    /**
     * Set or change a single color parameter on the pen state, and update the pen color.
     * @param {ColorParam} param - the name of the color parameter to set or change.
     * @param {number} value - the value to set or change the param by.
     * @param {PenState} penState - the pen state to update.
     * @param {boolean} change - if true change param by value, if false set param to value.
     * @private
     */
    _setOrChangeColorParam(param, value, penState, change) {
        switch (param) {
            case ColorParam.COLOR:
                penState.color = this._wrapColor(value + (change ? penState.color : 0));
                break;
            case ColorParam.SATURATION:
                penState.saturation = this._clampColorParam(value + (change ? penState.saturation : 0));
                break;
            case ColorParam.BRIGHTNESS:
                penState.brightness = this._clampColorParam(value + (change ? penState.brightness : 0));
                break;
            case ColorParam.TRANSPARENCY:
                penState.transparency = this._clampColorParam(value + (change ? penState.transparency : 0));
                break;
            default:
                log.warn(`Tried to set or change unknown color parameter: ${param}`);
        }
        this._updatePenColor(penState);
    }

    _setOrChangeFontParam(param, value, penState, change) {
        switch (param) {
            case FontParam.COLOR:
                penState.fontAttributes.font = value;
                break;
            case FontParam.SATURATION:
                penState.saturation = this._clampColorParam(value + (change ? penState.saturation : 0));
                break;
            case FontParam.BRIGHTNESS:
                penState.brightness = this._clampColorParam(value + (change ? penState.brightness : 0));
                break;
            case FontParam.TRANSPARENCY:
                penState.transparency = this._clampColorParam(value + (change ? penState.transparency : 0));
                break;
            default:
                log.warn(`Tried to set or change unknown color parameter: ${param}`);
        }
        this._updateFont(penState);
    }

    /**
     * The "change pen {ColorParam} by {number}" block changes one of the pen's color parameters
     * by a given amound.
     * @param {object} args - the block arguments.
     *  @property {ColorParam} COLOR_PARAM - the name of the selected color parameter.
     *  @property {number} VALUE - the amount to change the selected parameter by.
     * @param {object} util - utility object provided by the runtime.
     */
    changePenColorParamBy(args, util) {
        const penState = this._getPenState(util.target);
        this._setOrChangeColorParam(args.COLOR_PARAM, Cast.toNumber(args.VALUE), penState, true);
    }

    /**
     * The "set pen {ColorParam} to {number}" block sets one of the pen's color parameters
     * to a given amound.
     * @param {object} args - the block arguments.
     *  @property {ColorParam} COLOR_PARAM - the name of the selected color parameter.
     *  @property {number} VALUE - the amount to set the selected parameter to.
     * @param {object} util - utility object provided by the runtime.
     */
    setPenColorParamTo(args, util) {
        const penState = this._getPenState(util.target);
        this._setOrChangeColorParam(args.COLOR_PARAM, Cast.toNumber(args.VALUE), penState, false);
    }

    /**
     * The pen "change pen size by {number}" block changes the pen size by the given amount.
     * @param {object} args - the block arguments.
     *  @property {number} SIZE - the amount of desired size change.
     * @param {object} util - utility object provided by the runtime.
     */
    changePenSizeBy(args, util) {
        const penAttributes = this._getPenState(util.target).penAttributes;
        penAttributes.diameter = this._clampPenSize(penAttributes.diameter + Cast.toNumber(args.SIZE));
    }

    /**
     * The pen "set pen size to {number}" block sets the pen size to the given amount.
     * @param {object} args - the block arguments.
     *  @property {number} SIZE - the amount of desired size change.
     * @param {object} util - utility object provided by the runtime.
     */
    setPenSizeTo(args, util) {
        const penAttributes = this._getPenState(util.target).penAttributes;
        penAttributes.diameter = this._clampPenSize(Cast.toNumber(args.SIZE));
    }

    /* LEGACY OPCODES */
    /**
     * Scratch 2 "hue" param is equivelant to twice the new "color" param.
     * @param {object} args - the block arguments.
     *  @property {number} HUE - the amount to set the hue to.
     * @param {object} util - utility object provided by the runtime.
     */
    setPenHueToNumber(args, util) {
        const penState = this._getPenState(util.target);
        const hueValue = Cast.toNumber(args.HUE);
        const colorValue = hueValue / 2;
        this._setOrChangeColorParam(ColorParam.COLOR, colorValue, penState, false);
        this._setOrChangeColorParam(ColorParam.TRANSPARENCY, 0, penState, false);
        this._legacyUpdatePenColor(penState);
    }

    /**
     * Scratch 2 "hue" param is equivelant to twice the new "color" param.
     * @param {object} args - the block arguments.
     *  @property {number} HUE - the amount of desired hue change.
     * @param {object} util - utility object provided by the runtime.
     */
    changePenHueBy(args, util) {
        const penState = this._getPenState(util.target);
        const hueChange = Cast.toNumber(args.HUE);
        const colorChange = hueChange / 2;
        this._setOrChangeColorParam(ColorParam.COLOR, colorChange, penState, true);

        this._legacyUpdatePenColor(penState);
    }

    /**
     * Use legacy "set shade" code to calculate RGB value for shade,
     * then convert back to HSV and store those components.
     * It is important to also track the given shade in penState._shade
     * because it cannot be accurately backed out of the new HSV later.
     * @param {object} args - the block arguments.
     *  @property {number} SHADE - the amount to set the shade to.
     * @param {object} util - utility object provided by the runtime.
     */
    setPenShadeToNumber(args, util) {
        const penState = this._getPenState(util.target);
        let newShade = Cast.toNumber(args.SHADE);

        // Wrap clamp the new shade value the way scratch 2 did.
        newShade = newShade % 200;
        if (newShade < 0) newShade += 200;

        // And store the shade that was used to compute this new color for later use.
        penState._shade = newShade;

        this._legacyUpdatePenColor(penState);
    }

    /**
     * Because "shade" cannot be backed out of hsv consistently, use the previously
     * stored penState._shade to make the shade change.
     * @param {object} args - the block arguments.
     *  @property {number} SHADE - the amount of desired shade change.
     * @param {object} util - utility object provided by the runtime.
     */
    changePenShadeBy(args, util) {
        const penState = this._getPenState(util.target);
        const shadeChange = Cast.toNumber(args.SHADE);
        this.setPenShadeToNumber({
            SHADE: penState._shade + shadeChange
        }, util);
    }

    /**
     * Update the pen state's color from its hue & shade values, Scratch 2.0 style.
     * @param {object} penState - update the HSV & RGB values in this pen state from its hue & shade values.
     * @private
     */
    _legacyUpdatePenColor(penState) {
        // Create the new color in RGB using the scratch 2 "shade" model
        let rgb = Color.hsvToRgb({
            h: penState.color * 360 / 100,
            s: 1,
            v: 1
        });
        const shade = (penState._shade > 100) ? 200 - penState._shade : penState._shade;
        if (shade < 50) {
            rgb = Color.mixRgb(Color.RGB_BLACK, rgb, (10 + shade) / 60);
        } else {
            rgb = Color.mixRgb(rgb, Color.RGB_WHITE, (shade - 50) / 60);
        }

        // Update the pen state according to new color
        const hsv = Color.rgbToHsv(rgb);
        penState.color = 100 * hsv.h / 360;
        penState.saturation = 100 * hsv.s;
        penState.brightness = 100 * hsv.v;

        this._updatePenColor(penState);
    }
}

module.exports = Scratch3NewBlocks;
