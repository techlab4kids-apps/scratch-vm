const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const formatMessage = require('format-message');
const MathUtil = require('../../util/math-util');
const Cast = require('../../util/cast');

/**
 * Icon svg to be displayed at the left edge of each extension block, encoded as a data URI.
 * @type {string}
 */
// eslint-disable-next-line max-len
const blockIconURI = 'data:image/png;base64,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';

class ScratchTechLAB4KidsBlocks {

    // ********************************************************************************
    /**
     * The runtime instantiating this block package.
     * @type {Runtime}
     */
    constructor(runtime) {
        this.runtime = runtime;
    }

    concatenateWordsWithSpace(args, util) {
        return Cast.toString(args.WORD1) + Cast.toString(args.SEPARATOR) + Cast.toString(args.WORD2);
    }

    returnTrue(){
        return true;
    }

    returnFalse(){
        return false;
    }

    takePicture(args, util){
        import { Camera, CameraResultType } from '@capacitor/camera';

        const takePicture = async () => {
            const image = await Camera.getPhoto({
                quality: 90,
                allowEditing: false,
                resultType: CameraResultType.Uri,
                source: CameraSource.CAMERA,
                direction: CameraDirection.REAR
            });

            // image.webPath will contain a path that can be set as an image src.
            // You can access the original file using image.path, which can be
            // passed to the Filesystem API to read the raw data of the image,
            // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
            var imageUrl = image.webPath;

            // Can be set to the src of an image now
            imageElement.src = imageUrl;
        };
    }

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        return {
            id: 'techLAB4KidsBlocks',
            name: 'TechLAB 4 Kids Blocks',
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'takePicture',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'TechLAB4KidsBlocks.takePicture',
                        default: '[PICTURE_NAME]',
                        description: 'il nome della foto '
                    }),
                    arguments: {
                        PICTURE_NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: 'nome della foto'
                        }

                    },
                    showAsVariable: false
                },
                {
                    opcode: 'concatenateWordsWithSpace',

                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'TechLAB4KidsBlocks.concatenateWordsWithSpace',
                        default: 'unione di [WORD1] e [WORD2] con separatore [SEPARATOR]',
                        description: 'unisce le parole tramite il separatore indicato'
                    }),
                    arguments: {
                        WORD1: {
                            type: ArgumentType.STRING,
                            defaultValue: 'parola'
                        },
                        WORD2: {
                            type: ArgumentType.STRING,
                            defaultValue: 'parola'
                        },
                        SEPARATOR: {
                            type: ArgumentType.STRING,
                            defaultValue: ' '
                        }

                    },
                    showAsVariable: false
                },
                {
                    opcode: 'returnTrue',
                    func: 'returnTrue',
                    blockType: BlockType.BOOLEAN,
                    text: formatMessage({
                        id: 'TechLAB4KidsBlocks.returnTrue',
                        default: 'Vero',
                        description: 'restituisce sempre il valore booleano "Vero - True"'
                    }),

                    showAsVariable: false
                },
                {
                    opcode: 'returnFalse',
                    func: 'returnFalse',
                    blockType: BlockType.BOOLEAN,
                    text: formatMessage({
                        id: 'TechLAB4KidsBlocks.returnFalse',
                        default: 'Falso',
                        description: 'restituisce sempre il valore booleano "Falso - False"'
                    }),

                    showAsVariable: false
                },
                {
                    opcode: 'returnYes',
                    func: 'returnTrue',
                    blockType: BlockType.BOOLEAN,
                    text: formatMessage({
                        id: 'TechLAB4KidsBlocks.returnYes',
                        default: 'Si',
                        description: 'restituisce sempre il valore booleano "Vero - True"'
                    }),

                    showAsVariable: false
                },
                {
                    opcode: 'returnNo',
                    func: 'returnFalse',
                    blockType: BlockType.BOOLEAN,
                    text: formatMessage({
                        id: 'TechLAB4KidsBlocks.returnNo',
                        default: 'No',
                        description: 'restituisce sempre il valore booleano "Falso - False"'
                    }),

                    showAsVariable: false
                }
            ]
            // ,

            // translation_map: {
            //     it: {
            //         'writeText': 'Scrivi [TEXT] [IS_UPDATABLE]',
            //         'writeText.TEXT_default': 'Ciao!',
            //         'changeFontSizeBy': 'Porta la dimensione del font a [SIZE]',
            //         'setFontSizeTo': 'Cambia la dimensione del font di [SIZE]',
            //         'setFont': 'Imposta il carattere',
            //     }
            // }
        };
    }
}

module.exports = ScratchTechLAB4KidsBlocks;
