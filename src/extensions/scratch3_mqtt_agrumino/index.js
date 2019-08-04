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
const blockIconURI = 'data:image/png;base64,' +
    'iVBORw0KGgoAAAANSUhEUgAAAFoAAAB4CAYAAAByzOU/AAAABHNCSVQICAgIfAhkiAAADllJREFUeJzt' +
    'nH10U+Udx3/3JTc3SdM0SZMmJU3TF1poKaUVKWAFahFfqEUF5jnqNkGZbGegzuHmZG6TDT0ynNvc0bPt' +
    'H3VOz9wYsp0NnAgMCgXa0hdqbVpKW0oK6UuatEnzeu/+wCJtk9yb3HsTjrufv3qf53ef3y/f3vvc5/k9' +
    'z70AIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIifKLT6O5LdgxCgyY7gBR5yvJ8S94tyY7jqw7+1u43Wwx6' +
    'w4ZkB/KVpmhu0fb+U720RCIpTHYsX1lQBNWfOVDv7K3roQCASHY8QpO0Prp2Te1LBp0htd3abgMAf7Li' +
    'SBRJEVpKSEt+ufPVJwAAWjpaepMRQ6JJitDPbnnmNQInMACA7t6egWTEkGgSLrRWrb1366NbV08dDzuG' +
    'RxMdQzJItNDormdf2n1jgWNsNGahCZxYiCKokb+whCehQpszsx6uqV5bemOZwzU2EksbGIrl7d30y0MV' +
    'hRU/4Dc6YUmk0MRrP9770sxCmqZptg0gCJKx6+GXDlkyLIana556EkXRLH5DFI6ECV2QM3fzkkVLcmaW' +
    '+3xeN5vzEUBUOx7YcbDEUpIHACAn5eSKottf4DtOoUiU0MSeF/b8KFxFMBQKsDn/8TWP77+9qHLRjYXb' +
    'arZtxlAsm5cIBSYhQhfkzN1cVrwo7G0uI2VKpvPvXLT6rXVLalfNLCdwQlJdWv0zHkIUnEQIjf98x64d' +
    'EStxXBLt5ILMgue212zfFKn+2/dsfRTH8HwuASYCwYU2GU1fW1q2NDdSvVKRoopUp05Rr9vz2KsvR2sf' +
    'R3GsqmRV2G7pZkJwoZ/buuPZaPXpGp0uXLkElyz47bd+8x6Koowxbr1766MoiprjjTERCCp0Wmpa9f1r' +
    '1pVHszHqDPowxcqdG1/4q0quUrDxQ+CEZFnh0u/HFWSCEFTob6z/+lNMNvmWfNPMstol9/2hPK88phz1' +
    '9rXbtyAIEu6fdlMgmNA4hlu+98QzNUx2S8sr5t54bNFbvrtlzZaHYvUnJ+VkeW759yLVo0hyuxbBhK68' +
    '9bYnURRFmOyy52RrEATRAgAQOFG657FX98brc1vNd7+NAJIark4t196hJFX3x9s2V4QSmnjx6RcfZ2uc' +
    'okgpBgDpM7VPv00SZNyrLVqlNjXXkBvR7+Zl295EAEmLt30uCCK0Xqu/Nz87L+xoIhx55tyK8rzyn1YW' +
    'VZYyW0dny5ontkGY34VjEpkhdY6hLKtiD1cf8SCI0BvWbvhmLPaViyqrfvLQi8/x4bvYXJyjSdHUzixX' +
    'kWlmAIAN5V9/nMClFXz4igXehUYQRPv0pu1r2drTNA1ZRFYhm/EyWx5c/uCs0Y5RZSoEAEAARe5f+PDv' +
    'IMEpYt6d5ZpzHyBJMuq0+kbefee95iJTUcSZYzysW1K7isCJad1QkbH0+iadsqwlt2jk2of59MkE70Kv' +
    'v+dB1pthrl656s4mzYLkKSoKKr419TeGYvlmde604d3G8sd2QQK3OfAqNIIgqs0bN1Wxtd//1/2daSlp' +
    'KXzGMMXm1ZseAQASAMCYalo3s96izbcYVaatQvgOB59Co0a98S65XM7qKuno6BhenH0r51FGJNJT01UZ' +
    'aRnrAQBWzr3rG+FsHih95PuQoKuaN6ExuaSy8tbb7mJrf/zwiQEcxTG+/IejZvHazaREtnJBZtnCcPVZ' +
    'akuWVqFLSF/Nyw9FMMSiyFOv++nmnRuNekPEtOcUzS2tV02YSfAccoGp0DIyPG7M1uRH9KUkU3PabE1v' +
    'CR0LL1e0sjD9MZlUJou0ijKTU/89mZBNM/32PvvKuWui3mUlmbeUSnFyudCx8CK04d78DYbcTFbZttGR' +
    'UW+5qbyED79MdFzsGaIphDHfsiCzjHW6IF44C43gaIF6sbF4jiWL1dW8b9/+di75DLY0dZ/rypIXLmBj' +
    'e+e8+9YDgFTIeDgLLc9WrQMA0OdnskpDajC1gatPJoJUMOR2AuOi7xQqmVqVIlXeKWRMnIXWLM6sBgAg' +
    'dDINk21jQ+NgXkbeHK4+mfhPw5EWNaGP6R+ak15wt1DxAHAXWqKvzqkEAHBhbpzJ+Mzps4I/BJt7Wi6Y' +
    '5cVRl8/CUZF9O+uhaTxwEhqVYqV4KqEAALgcsAMN0Xd3pUvTM7j4Y8Lpcbq9Y5g6hl1m18nTFeYjCMI6' +
    'tRsrnISWpsvLpv4O0EEYDAxFtLXbhzwFxgJBl5NOt7VcSpGoGbuwSMglCsHeDuMktNysmjaFtvr6Itoe' +
    'OXrkAhdfTBw8e/hcpjxvHpc20uSa+QDAOByMB65CT5txfeaLrOXw1ZFJLr6icazteKuJnFfGbBkdjSI9' +
    'l9DI1vMR00w4Ca3ITbPceNw8+XnEfppAJDIuviLR2tvWo4bsYj7aUsnUhsx1Bdv5aGsmnIQmM5XT9lE4' +
    'Qi7o8YcfWGSkZPD+oLGNDo74xiTpKGC85GxkBap8XVX2UgBgHEHFCiehJWpy1tL+cXdjWNssnZnXEceE' +
    'd2Kyu8fmk2HKsNsL4iFYhplQApcgGDJrUw9XuA3vcHTWlXTC3QRBOjStLBQIAQrMOQe2UBRF1be22DRS' +
    'QyZfbU7KvTBZTGkBADASt/DV7hS8L2U5QxNQ72mZVjZ4ZXCcTx8fnz32mUFmyeOzze55fUCjNAIAgCkI' +
    '3l/Z4CQ0FaRC4cr/4TrKpdmoHDx7uNkkL2CVLGKLV+aD3vwvny24kuB9YsVJaK9tPOwMpcc/AM2Tn3Np' +
    'OiyfnDvSbCLnLWK2jI2OhRcghFHXj3EFEfekJxLchL48fiVS3ftj/7o+1EtPT2e1/TYax9vrzhslBbyL' +
    '7NA6oS/38rQyjMTkfPvhJPS4dbQzUl2Pf+D6CISUkajX7437xfrmnpYLaiq7KI4URlQolIJzSz6bVY5K' +
    'Md7H/JyEdl90nI9W/7bjAIxT195uG3AM2OPxcWl4YCjokmUAILw/uDsWXgBX2sSscpTAeF8E4BT85CVX' +
    'XbR6V2gC3nEcAACA4YnhmN6QBQBweVye3r6hEIkpeN/7Max3QNf83rB1wXH/GN/+OAkddAdOBz0BbzSb' +
    'oxNn4by3C4CI/Zsc9W3N/bEm8NngI/3QuCzyzUgFKN6/H8L1dvQM/qPrYyaj3w7/GXQ5GepYGj549pMm' +
    'rtm4cFAoDWdua4VJeeTrI+D0RXzIxwvnfm/kRP8HTDajISd0ltrz2D4Qz1gbOrNk82NeJWFDW3knjOgd' +
    'UW0CTu8lvv1yFto35NnnvTLB2P82+TqQf+PHGe08Xo+Xdsv0fI8wAAAuFPbBxbnMGgZd/oijqXjh40nu' +
    'u/j7c2+wMewosRn6FNHvymMtp6wKPC2mboYNl81Xoa3cymgXmgz6qECog2//vAyZXB1Db/jHvIz5DAqh' +
    'kb+Zj8IYMXtIBQDQ2NVkzZLPC7tPjgtDGaNRH37TbI/11QMAmw8BxAQ/Y1Mahrv21u9mNgTwYF740Pwp' +
    '+NHZv2VijOJ9RubQOqF+ZTNQKMVsDAAjdZcO8h0DAI/Zu4mu0dedrXbmexMArpKjsC/rGNDIlx3xic9O' +
    'nteSRl7zwE71ONRVNUEIC5v7Cou7Z+xDPmOYgs/Zlrfr9dNPMO45+IJu5QAcMp6+fuwZD/E6G3OlTUBd' +
    'VSMEJUHW59gOWD+hQ5Qgi8i87k+mA1T/uHVEolthXsHG3iYbBjJEAGajHLhXxdsOJlfaBJy4owH80ti6' +
    'WuueU1spf6iHrzhuhPeN4D67+7+4DL89pUA767M+4ehR2mCyy2nTug28pCbjFdn2kfXjsaZBwT6yIsQr' +
    'YMG+P7VtdLbbu9kY00CDdZU9Z0zj4uw4XpGDLr974C/tgr7PIsy7djSMdO4+ec/k5XFWGbsQDmj9imbw' +
    'ynxxu3QrPVBX1RizyAAA51/49Ek6RF+M2zkLBHupkQ5R3ed/eHi1d3BimI29V+aD0yuap610sMWt9MDx' +
    '6gbwkbHngjp+fnyXb8jzXswnxoigL+vQFG0f+vTiQe0y00ZcSTCOkb0yH3jlPjAOsP/sxpTI8dwNn79c' +
    '94qrzb4z5hPjQFChAa6JbT988aPUBbpaqVbO+GUBp3ocFBNyUI0x7yP3ynxworoxaiYuHFSQCp3/weFt' +
    'E9bRV2I6kQOCCw0AABQ9MnS0/31Sp1gptzAP4+zGEZgzoAfCF/kNjAARhLrqRphQemIKxdlqt7Y//2mN' +
    'f3Ryf0wnciQxQl/D7WiwvUf7QvNVC/XzoxnSKA1jGheYL2YCEmZzJ43QcGplMzi0TtbOqSAV6v71mTcu' +
    'fdC+kQ5SvTFHz5FECg0AEBi3jnzoarMH9KtyqsKq+AWTch/IPCSkOWbv+Gpd3Ak281XWTm0fWT/ufPnE' +
    'A55+1zsgQMKIDYLsBWYDnkKsvuVXd+8HJR5xK4LUS8CaA5WAhb68Hgayr0DD8jZWPoaO9p7uf7ft+aA7' +
    'cIR7xNxImtAAAAiKzCneXvlPxVJdxP0aJU2FkNd57UUBr8wHh+89CQEiev7iysELx2z7Ol4JuPyCZOLi' +
    'IdFdx3RoGLfX9//R3zMu0yw3LQ/XlbiVHsizXhO6cVk7ONWR0962v3ce6nz15DcdDYO7KF+I1cw0UST1' +
    'ir4RXC5ZWfFazYFg2uyvfK06VAEhjILjq8+GPffSB+0fXflX988of+ic4IHGyU0jNAAAIKAu2rR0v3JN' +
    '5rTsX1FrPjg0Lhg0TZ/R2w5YP7n8t47nKV+oIaFxxsHNJfQXKC3qp4p/ccdeGqMxAADDZR1czRy+vlDg' +
    'ah+60PX66e8Ex/2MWx1uFm5KoQEAUAlaUrKz6gBZqLJIHRKfTx2QUkEq1PnKyZdd5+2/AIDYpoMiUVHO' +
    'qS3ct/it+1wLd6++jJF4wj+j9v8EoshVPwsIpCc7EBERERERERERERERERERERERERERERERERERERER' +
    'EREAgP8BWGFv6FkT3BEAAAAASUVORK5CYII=';

class ScratchMqttAgruminoClientBlocks {

    // ********************************************************************************
    /**
     * The runtime instantiating this block package.
     * @type {Runtime}
     */
    constructor(runtime) {
        this.runtime = runtime;
    }

    agruminoField(args, util){
        return args.AGRUMINO_FIELD;
    }

    getDataFromMessage(args, util){
        let object = {};
        try {
            object = JSON.parse(args.AGRUMINO_MESSAGE);
        } catch(e) {
            log.log("error parsing json (is a json source?)"); // error in the above string (in this case, yes)!
        }

        let field = args.FIELD;
        if(object.hasOwnProperty(field)){
            let fieldValue = object[field];
            return fieldValue;
        }
        return '';
    }

    agruminoCommand(args, util){
        
        return "{'name': '" + Cast.toString(args.AGRUMINO_COMMAND) + "'}";
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        return {
            id: 'mqttAgruminoClient',
            name: 'MQTT Agrumino Client (by Lifely)',
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'agruminoField',
                    text: formatMessage({
                        id: 'mqtt.agruminoField',
                        default: "Dato [AGRUMINO_FIELD]",
                        description: ''
                    }),
                    arguments: {
                        AGRUMINO_FIELD: {
                            type: ArgumentType.STRING,
                            menu: 'agruminoFields',
                            defaultValue: 'Temperatura'
                        }
                    },
                    blockType: BlockType.REPORTER,
                    showAsVariable: false
                },
                {
                    opcode: 'agruminoFieldTemperature',
                    text: formatMessage({
                        id: 'mqtt.agruminoFieldTemperature',
                        default: "Temperatura (da [AGRUMINO_MESSAGE] [FIELD])",
                        description: ''
                    }),
                    func: 'getDataFromMessage',
                    arguments: {
                        AGRUMINO_MESSAGE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'messaggio mqtt JSON'
                        }, 
                        FIELD: {
                            type: ArgumentType.STRING,
                            defaultValue: 'temperature'
                        }

                    },
                    blockType: BlockType.REPORTER,
                    showAsVariable: true
                },
                {
                    opcode: 'agruminoFieldIlluminance',
                    text: formatMessage({
                        id: 'mqtt.agruminoFieldIlluminance',
                        default: "Luminosità (da [AGRUMINO_MESSAGE] [FIELD])",
                        description: ''
                    }),
                    func: 'getDataFromMessage',
                    arguments: {
                        AGRUMINO_MESSAGE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'messaggio mqtt JSON'
                        }, 
                        FIELD: {
                            type: ArgumentType.STRING,
                            defaultValue: 'illuminance'
                        }
                    },
                    blockType: BlockType.REPORTER,
                    showAsVariable: true
                },
                {
                    opcode: 'agruminoFieldISoilMoisture',
                    text: formatMessage({
                        id: 'mqtt.agruminoFieldISoilMoisture',
                        default: "Umidità del terreno (da [AGRUMINO_MESSAGE] [FIELD])",
                        description: ''
                    }),
                    func: 'getDataFromMessage',
                    arguments: {
                        AGRUMINO_MESSAGE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'messaggio mqtt JSON'
                        }, 
                        FIELD: {
                            type: ArgumentType.STRING,
                            defaultValue: 'soilMoisture'
                        }
                    },
                    blockType: BlockType.REPORTER,
                    showAsVariable: true
                },
                {
                    opcode: 'agruminoFieldBatteryLevel',
                    text: formatMessage({
                        id: 'mqtt.agruminoFieldBatteryLevel',
                        default: "Umidità del terreno (da [AGRUMINO_MESSAGE] [FIELD])",
                        description: ''
                    }),
                    func: 'getDataFromMessage',
                    arguments: {
                        AGRUMINO_MESSAGE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'messaggio mqtt JSON'
                        }, 
                        FIELD: {
                            type: ArgumentType.STRING,
                            defaultValue: 'batteryLevel'
                        }
                    },
                    blockType: BlockType.REPORTER,
                    showAsVariable: true
                },
                {
                    opcode: 'agruminoFieldIsLedOn',
                    text: formatMessage({
                        id: 'mqtt.agruminoFieldIsLedOn',
                        default: "Led acceso (da [AGRUMINO_MESSAGE] [FIELD])",
                        description: ''
                    }),
                    func: 'getDataFromMessage',
                    arguments: {
                        AGRUMINO_MESSAGE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'messaggio mqtt JSON'
                        }, 
                        FIELD: {
                            type: ArgumentType.STRING,
                            defaultValue: 'ledStatus'
                        }
                    },
                    blockType: BlockType.REPORTER,
                    showAsVariable: true
                },
                {
                    opcode: 'agruminoCommand',
                    text: formatMessage({
                        id: 'mqtt.agruminoCommand',
                        default: "Invia comando (da [AGRUMINO_COMMAND])",
                        description: ''
                    }),
                    arguments: {
                        AGRUMINO_COMMAND: {
                            type: ArgumentType.STRING,
                            menu: 'agruminoCommands',
                            defaultValue: 'messaggio mqtt JSON'
                        }
                    },
                    blockType: BlockType.REPORTER,
                    showAsVariable: false
                },
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
                agruminoFields: {
                    acceptReporters: false,
                    items: [{
                            text: formatMessage({
                                id: 'mqttAgrumino.fields.temperature',
                                default: 'Temperatura',
                            }),
                            value: 'temperature'
                        },
                        {
                            text: formatMessage({
                                id: 'mqttAgrumino.fields.illuminance',
                                default: 'Luminosità',
                            }),
                            value: 'illuminance'
                        },
                        {
                            text: formatMessage({
                                id: 'mqttAgrumino.fields.soilMoisture',
                                default: 'Umidità del suolo',
                            }),
                            value: 'soilMoisture'
                        },
                        {
                            text: formatMessage({
                                id: 'mqttAgrumino.fields.batteryLevel',
                                default: 'Livello batteria',
                            }),
                            value: 'batteryLevel'
                        },
                        {
                            text: formatMessage({
                                id: 'mqttAgrumino.fields.isLedOn',
                                default: 'Led acceso',
                            }),
                            value: 'ledStatus'
                        }
                    ]
                },
                agruminoCommands: {
                    acceptReporters: false,
                    items: [{
                            text: formatMessage({
                                id: 'mqttAgrumino.fields.switchLed',
                                default: 'Commuta lo stato del Led',
                            }),
                            value: 'toggleLed'
                        },
                        {
                            text: formatMessage({
                                id: 'mqttAgrumino.fields.ledOn',
                                default: 'Accendi il led',
                            }),
                            value: 'setLedStatusOn'
                        },
                        {
                            text: formatMessage({
                                id: 'mqttAgrumino.fields.ledOff',
                                default: 'Spegni il led',
                            }),
                            value: 'setLedStatusOff'
                        },
                        {
                            text: formatMessage({
                                id: 'mqttAgrumino.fields.getLedStatus',
                                default: 'Stato del led',
                            }),
                            value: 'getLedStatus'
                        }
                    ]
                }
            }
        };
    }
}

module.exports = ScratchMqttAgruminoClientBlocks;
