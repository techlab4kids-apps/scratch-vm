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
const mqtt = require('mqtt')

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+cGVuLWljb248L3RpdGxlPjxnIHN0cm9rZT0iIzU3NUU3NSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Ik04Ljc1MyAzNC42MDJsLTQuMjUgMS43OCAxLjc4My00LjIzN2MxLjIxOC0yLjg5MiAyLjkwNy01LjQyMyA1LjAzLTcuNTM4TDMxLjA2NiA0LjkzYy44NDYtLjg0MiAyLjY1LS40MSA0LjAzMi45NjcgMS4zOCAxLjM3NSAxLjgxNiAzLjE3My45NyA0LjAxNUwxNi4zMTggMjkuNTljLTIuMTIzIDIuMTE2LTQuNjY0IDMuOC03LjU2NSA1LjAxMiIgZmlsbD0iI0ZGRiIvPjxwYXRoIGQ9Ik0yOS40MSA2LjExcy00LjQ1LTIuMzc4LTguMjAyIDUuNzcyYy0xLjczNCAzLjc2Ni00LjM1IDEuNTQ2LTQuMzUgMS41NDYiLz48cGF0aCBkPSJNMzYuNDIgOC44MjVjMCAuNDYzLS4xNC44NzMtLjQzMiAxLjE2NGwtOS4zMzUgOS4zYy4yODItLjI5LjQxLS42NjguNDEtMS4xMiAwLS44NzQtLjUwNy0xLjk2My0xLjQwNi0yLjg2OC0xLjM2Mi0xLjM1OC0zLjE0Ny0xLjgtNC4wMDItLjk5TDMwLjk5IDUuMDFjLjg0NC0uODQgMi42NS0uNDEgNC4wMzUuOTYuODk4LjkwNCAxLjM5NiAxLjk4MiAxLjM5NiAyLjg1NU0xMC41MTUgMzMuNzc0Yy0uNTczLjMwMi0xLjE1Ny41Ny0xLjc2NC44M0w0LjUgMzYuMzgybDEuNzg2LTQuMjM1Yy4yNTgtLjYwNC41My0xLjE4Ni44MzMtMS43NTcuNjkuMTgzIDEuNDQ4LjYyNSAyLjEwOCAxLjI4Mi42Ni42NTggMS4xMDIgMS40MTIgMS4yODcgMi4xMDIiIGZpbGw9IiM0Qzk3RkYiLz48cGF0aCBkPSJNMzYuNDk4IDguNzQ4YzAgLjQ2NC0uMTQuODc0LS40MzMgMS4xNjVsLTE5Ljc0MiAxOS42OGMtMi4xMyAyLjExLTQuNjczIDMuNzkzLTcuNTcyIDUuMDFMNC41IDM2LjM4bC45NzQtMi4zMTYgMS45MjUtLjgwOGMyLjg5OC0xLjIxOCA1LjQ0LTIuOSA3LjU3LTUuMDFsMTkuNzQzLTE5LjY4Yy4yOTItLjI5Mi40MzItLjcwMi40MzItMS4xNjUgMC0uNjQ2LS4yNy0xLjQtLjc4LTIuMTIyLjI1LjE3Mi41LjM3Ny43MzcuNjE0Ljg5OC45MDUgMS4zOTYgMS45ODMgMS4zOTYgMi44NTYiIGZpbGw9IiM1NzVFNzUiIG9wYWNpdHk9Ii4xNSIvPjxwYXRoIGQ9Ik0xOC40NSAxMi44M2MwIC41LS40MDQuOTA1LS45MDQuOTA1cy0uOTA1LS40MDUtLjkwNS0uOTA0YzAtLjUuNDA3LS45MDMuOTA2LS45MDMuNSAwIC45MDQuNDA0LjkwNC45MDR6IiBmaWxsPSIjNTc1RTc1Ii8+PC9nPjwvc3ZnPg==';

class ScratchMqttClientBlocks {

    _uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // ********************************************************************************
    /**
     * The runtime instantiating this block package.
     * @type {Runtime}
     */
    constructor(runtime) {
        this.runtime = runtime;
        this.clientID = this._uuidv4();
        this._isClientConnected = false;
        this.mqttMessages = new Array;



        // this._onTargetCreated = this._onTargetCreated.bind(this);
        // this._onTargetMoved = this._onTargetMoved.bind(this);

        // runtime.on('targetWasCreated', this._onTargetCreated);
        // runtime.on('RUNTIME_DISPOSED', this.clear.bind(this));
    }

    writeLog(args) {
        const text = Cast.toString(args.TEXT);
        log.log(text);
    }

    isClientConnected(args, util) {
        return this._isClientConnected;
    }

    subscribe(args, util) {
        ctx = this;
        let topic = args.TOPIC;
        this.client.subscribe(args.TOPIC, function (err) {
            if (!err) {
                ctx.client.publish('scratch_presence', "subscribed " + ctx.clientID + " to topic: " + topic)
            }
        })
    }

    publish(args, util) {
        let topic = args.TOPIC;
        let message = args.MESSAGE

        this.client.publish(topic, message)    }

    getMessage(args, util) {
        let message = this.mqttMessages[args.TOPIC];
        if (message && message.length > 0) {
            return this.mqttMessages[args.TOPIC];
        } else {
            return "no message";
        }
    }

    getFieldFormJson(args, util){
        let object = JSON.parse(args.MESSAGE);

        let field = args.FIELD;
        if(object.hasOwnProperty(field)){
            let fieldValue = object[field];
            return fieldValue;
        }
        return '';
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        return {
            id: 'mqttClient',
            name: 'MQTT Client',
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
                    }
                },
                {
                    opcode: 'connect',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'mqtt.connect',
                        default: 'connetti al broker [BROKER] sulla porta [PORT] con ID [CLIEND_ID]'
                    }),
                    arguments: {
                        BROKER: {
                            type: ArgumentType.STRING,
                            defaultValue: "localhost"
                        },
                        PORT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1884
                        },
                        CLIEND_ID: {
                            type: ArgumentType.STRING,
                            defaultValue: this.clientID
                        }

                    }
                },
                {
                    opcode: 'disconnect',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'mqtt.disconnect',
                        default: 'disconnette dal broker [BROKER]'
                    }),
                    arguments: {
                        BROKER: {
                            type: ArgumentType.STRING,
                            defaultValue: "localhost"
                        }
                    }
                },
                {
                    opcode: 'subscribe',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'mqtt.subscribe',
                        default: 'si sottoscrive al topic [TOPIC]'
                    }),
                    arguments: {
                        TOPIC: {
                            type: ArgumentType.STRING,
                            defaultValue: "/#"
                        }
                    }
                },
                {
                    opcode: 'publish',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'mqtt.publish',
                        default: 'pubblica sul topic [TOPIC]'
                    }),
                    arguments: {
                        TOPIC: {
                            type: ArgumentType.STRING,
                            defaultValue: "TOPIC"
                        },
                        MESSAGE: {
                            type: ArgumentType.STRING,
                            defaultValue: "testo messaggio"
                        }
                    }
                },
                {
                    opcode: 'isClientConnected',
                    text: formatMessage({
                        id: 'mqtt.isClientConnected',
                        default: "connesso",
                        description: 'indica se il client è connesso o meno al broker'
                    }),
                    blockType: BlockType.REPORTER,
                    showAsVariable: true
                },
                {
                    opcode: 'getMessage',
                    text: formatMessage({
                        id: 'mqtt.messageArrived',
                        default: "messaggio dal topic [TOPIC]",
                        description: 'messaggio ricevuto'
                    }),
                    arguments: {
                        TOPIC: {
                            type: ArgumentType.STRING,
                            defaultValue: 'scratch_presence'
                        }
                    },
                    blockType: BlockType.REPORTER,
                    showAsVariable: true
                },
                {
                    opcode: 'getFieldFormJson',
                    text: formatMessage({
                        id: 'mqtt.getFieldFormJson',
                        default: "valore del campo [FIELD] del messaggio json [MESSAGE]",
                        description: 'estrae il valore del campo dal messaggio'
                    }),
                    arguments: {
                        MESSAGE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'message'
                        },
                        FIELD: {
                            type: ArgumentType.STRING,
                            defaultValue: 'field'
                        }
                    },
                    blockType: BlockType.REPORTER,
                    showAsVariable: true
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
            }
            // ,

            // menus: {
            //     colorParam: {
            //         acceptReporters: true,
            //         items: this._initColorParam()
            //     },
            //     fonts: {
            //         acceptReporters: true,
            //         items: this._supportedFonts()
            //     },
            //     isUpdatableOptions: {
            //         acceptReporters: true,
            //         items: this._initIsUpdatableOptions()
            //     }
            // }
        };
    }

    connect(args, util) {
        let ctx = this;
        this.client = mqtt.connect({
            host: args.BROKER,
            port: args.PORT,
            clientID: args.CLIEND_ID
        });

        this.client.on('connect', function () {
            ctx._isClientConnected = true;
            log.log("client connected with id: " + ctx.clientID)
            ctx.client.subscribe('scratch_presence', function (err) {
                if (!err) {
                    ctx.client.publish('scratch_presence', ctx.clientID)
                }
            })
        });

        this.client.on('message', function (topic, message) {
            // message is Buffer
            log.log(message.toString());
            (ctx.mqttMessages[topic] = ctx.mqttMessages[topic] || []) = message.toString();
            // ctx.client.end()
        });


    }



}

module.exports = ScratchMqttClientBlocks;
