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

class ScratchFabLabSulcisBlocks {

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

    /**
     * @returns {object} metadata for this extension and its blocks.
     */
    getInfo() {
        return {
            id: 'fabLab4KidsBlocks',
            name: 'FabLAB 4 Kids Blocks',
            blockIconURI: blockIconURI,
            blocks: [
                {
                    opcode: 'concatenateWordsWithSpace',
                    blockType: BlockType.REPORTER,
                    text: formatMessage({
                        id: 'fabLab4KidsBlocks.concatenateWordsWithSpace',
                        default: 'unione [WORD1] [WORD2] [SEPARATOR]',
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

module.exports = ScratchFabLabSulcisBlocks;
