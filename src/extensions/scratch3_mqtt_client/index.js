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
const blockIconURI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHUAAACBCAYAAAD+B/WzAAAABHNCSVQICAgIfAhkiAAAIABJREFUeJztvVmTJElyJvapmZ9x5dnV13QNFpgBsEsuhELhCn8fn/eBT/wj/B9L4e6C2AWBAaYx3T3dVZVXHH672T6o2uEeEVlZNftAEaZJV2eEh5u5mamZHp+qqQOv5bW8ltfyWl7La3ktr+W1vJbX8lpey2t5La/ltbyW1/JaXstr+f98oT+lct/0dugN2qpH343o2xF2NP+9+vb/q6IShTTXSDKNrEyRZhppnnwWfT6rUr3v7PbDAX0zwowGRARyLdFxk0dXyP2h6PPpulys+w/Whs/8kz1dhY4+nC0vnoQX3OjGcTweC2sBayyMjQcQ3SFjsQCSRCErUqxuSpSr7JPo9Ek3t4fOPn2o0Ow7T0gLYDAGxlqMxsIY6ZgNA+Fr/JsxFuNoYIzBMIwYR+O/WwMeMKxMDEFrgtYaaaqQpgmyLEGSaiSJgiJZFHZK2/jZ7rvFdCLn12z8v+jW0Ea40U29NXFdC2OBcRzRdwP6vsdoDKwFlAKyLMN6U2CzLlCUKXSi4DsPwI6AGQ3saGEGA54ynodyneHqyyWS7GU798VErbatvfvhiZ+jCMZaNMOAdhjRDSOMDQS08nny3QCjNTBCxGEY0XUDunZAXXdomhZN06Nte3TdwBNiLIgApRWyNEFZZlitcqw3C2w2BZbLHGWRI0k1lOL5MfLc0AcLa6Rvbpfb8D3cK4vAWuYIxk7aMbPvk+smtNEPI5q6w3Z3wG5XoWk7WGuQpSkuLxd4+/Yav/6zG1xdr5FlGkoFLif7G6Y3GDuLsRuBkdsmRfji7QWK5cd37YuIur2r7MPPeyjFtzfjgGYcMI6y+2RzWcusxcpuNeZ4Eiymk+AIPPQj2m5A0/RomhZV1aJpOvT9IDuZuVmiFfIiRVlmWK8LrDclLi6WWC4yZFkCIqYuE8Y97zRB4r/G3et2yBHR3QIJ97kFw+MMYzLGom177PY1dts96qbFMIxQirBc5vjq60u8fXuN29s1yjKDUgpElslKgNJMXmsB01jYLizGm19tsLwonqXbR4labVv7/g9PUIpgYFGPA/pxnKzmeBUbkRtM1Omu9YM+MXGONRtj0HcjmrZDXXeoqgZ11aLtembXxoIAKEVIU408T7HelLi+WuLiYoHlskCWJ1CKZPFMd+K5v34MCBN48n5jvWy35kT96HvfDzgcGmx3exwONfp+ABGhXGR482aDt99d46uvL7FYZH7DxPoJEYEUYHsLU1tAnvfln18hL9OztHuWqF0z2J//6R5EBAugMj0GXqrHg3IDllXPMnQ+odFuBoBTOyhaKP3A8qlphLh1h7rpWF6NvACICEmiUS4ybNYlrq4WuLhcYrUskGYJiADybPllhAWm1528PFnvOcJai3EYUVUtttsDdvsD+n4AYJFlKW6/WOPXb2/wzTeXWC5zkbMRYYlZMikAo8V4sMAIQAFf/+YaSapP0i95jqiPP+8By8pIgwGjPNCtBqMsYFjYKwBGEWAQWIn/3RXewcryIrGKCRsUBgI3BJACK0UJ78bFokDb9qibDnXdoq5btG2Pvh8wDCN22xp11eHpqcZmc8DV9RKXF0sslznSNOF+O63U92XaN6VICML9sSCQKG3KWJi4n76/lufIWiiQKIVuTghIEiyXBK0VtCZsdxW6rkfbDnj3botxMBhGg29/dYn1qoDWGkTcB9agLawhkCbokjBWrGs8vjucpdtZotb71r7/ntluRwYGFppkxfPT/EPDIJiGTHgrJkukcnr7JdI6SSYuniiSurCs4WqFTHZknmdYLgu0TY+qanGoa5a93eAJ3DQddrsaD5sKV5e8c5fLHFmaRIQNmmcgbkRoy4vTursJUT/PLAx1irAAaYWyzEC0hlIa2+0eTct9vrvbwVjmOt99d431pgSRCs+WfsASKAVUBpiWUD016JreZsUxGz5L1N2HGuCNh5EslCUYN9nW8ga2MtqIKMw6ZJVb6ww3P4E2rmOje10brm2mOCxZ/xytCUQEpRXSJEFeZCibAlXVoDrUaNoWfT+g7wYMg0HTDNhvazw+Vbi6WuHqconFMkeSKNCEkPLJujEIg5JBWrfWJgsBvr+hKb5fKYgICnOjtEJRiFKkCLTdo6lb9P2I+/s9ix1j8d3bG1xcFEgSLW2TiATpQ05Az2x4d1+fpJ0+dXHoRvv4ywEEwqgMjHL99giD/CFMlwlFg8f0Xr/i6fj6GQAi4AezxSjcQGmNNNHI8hR5lkInrP1aWBhrMA4jun4QhatD1w5s2CsFrZUswNAPotC/+XULOjsHLx0nEaBlQSrS3MdxxDgYdF2Pph0AAHmeIsuSifLk1gcpt9OAvh3xv/8f//5/w6yc3Kld3cNYC1KAkZULnGCT1gr7dEWGrmRnA5HMjO6Z7W63NfmKBfc7nkILKNkVlqAMYCiwNiJCojWyPMOizFHVLaqqRtP06PsefTdgN4zomh7VocX+do2b6yVWyxJJqqI1M+2XUoGVKrBMJRmjmc+F66MbLx2zYjeaLNVYbxZQslkOVYNhtHh8PLDlYAzsr29xeVkiEZDC8whroTLC2PH2rbatXWzyyao/SdS26qGIMFqDURkkSsNaC2VODyZmnzz4sOtYT5qyLKVYEWBN2RFW1onbMU6pAo4VFCJmcZbVfKV4UeQqgdYKWZ6hLHJUNZtDbCcOqJsOw2BQNx2qfY3b2w02FwsURQqtlF+88QJk5QnSF+sXG/fLTibczBbfRMZSRHClkKUEWi1kShSqqsY4Gjw9HfD992Id0C0uL0okCcFzDAso4TDGGHRNf0S/k0QdeoM5KeYKjJcniBUn7gw5WUiIWJfbhzZqmERTdo2wPHUs3PpJs/531w//i9QXXQKJZvhQK4UsTVHmOfZVjcOhRtuyrXvYj+i6HlXV4fp6hevrNdbrQsCLaP2AF57bydbrAL73EMs2fLehj07GhjbjTQCkaYLVciGKEXA4NBjHEdttjT/84R6kCPrPbrG5WEArad/Jew3YEa6jHydq344AAeNoQAkJH493qBuFrFpRbvy6pTAwJXWt1I1B/In2KKaBshbmjEYcf3dNMKuWnSD2r5NdRIQkVUizBHmW4rCvUTcN+n5A1w14fDygaXocDi1ubte4ulyiLFMorVlJmokKigg1Ue5mXGTeZ+Yq8HOoEOYjyTSWVPjFXx1qDMOIx6cK9C+ERCu8VYTVugRpN8nW6zPjcOwVO0lUa5jJGMsmBYGFtYmJ4Ajh7FD/UzQwimQT8ydmYXOZyiskrBWcmLS5lu3uVTxQY48nmBSBrEaWEZTSSLMMWZXhcKjQth3G0eBQtei6HnXd4XBocHuzxmazYO0TDMbbGYEdJzKnCBvZrbGMVbIQ5jJWAUjSBMtlyQvHWuwPDcZhxOPjAf/8e4AU8PbtLVarAkqT9Eem3avGHyFqXIjIG+Vk5sRwq1EuGeKFrHjgz4ITTkB4cCJ0zplPUzkUTZZxO9X6R3ulJqrj5bJiG9f9TZMEVVWjrht0/YC+H7HdVmjbHk3d482bAVeXK+RFisBYWBcwhoJe5JUnGf455emUjJ0Q1oISjcWyAMAI3KFqMAwjHh4O+P0/EzQpfPvdDdarXPTKY2K+iKi8Qx2XdfLvFLtxFayIEvL1nwMnJosC83acjH0OnMDkOZ7NxeCHY53KQoEVFLVcIM0SpFkqWnKHcRxR1x2G0bD3qBtwc7NGuchFMYnnQJ5qeYFaWdCx8hTKMXdjy2A+JiBJNBaLwrsvD1UNMxom7PcKSiuo766xXhWT8c/Li3YqkVMYZgR1+gsivUCUhRicsNEEO3DCKz6E0B7gwQmCjRQTATKcYhKJZSdi3OJygEcAP6Tvgfrii82RKI0sTXFIKlR1g65jt9/D48G7Bm9vN1itciRJEnzIjuURosXnLsUiBdNxWqkknMxxFAveDEoIu1yWoh9YVFWDYTC4uztAa4Uk1ci/0ygo/XSiuue7nepYsPFymQAFUMRK/IDcQBWBjI3WlNsx5FfjfOfHtqFvS3YDrykCGUzqTGSXYmA9EBHBYI9ZvCaklEBpBa01dJKgOrD/cxwMtltmf2074IsvNri8XIp2HJQmZ479qTJWIWj6SgFpqrBaLWDBnqu6btF1Az582LHzokjxzc1VBHC8kKh+J0QqvCee7EgDZj9EYND5xEAsMVuSfQgPThDxAjkyzs+AEwqCyMXgxGnZpcDtGlGiHCg/LVxHk0Iu8F2iNdShQtOwolIdDIbBYOhH9P2Iq+slyjyV/h3L2FjBexFAcU7GKoU0I6xWC++SbFt2P/7yyxOKMsXNao0yPU2+80QlQtv0eKx65HkKt4p412rvyA3QmkBuwqbjAb0MnIgHxZMV74bA6mNwgts9B05AfJ8KTmmbjNDX0QpAloBUCS0QYlU36LsBbdvj7n6HthvQdz1ubjZYLHNxbDsghVt0Cp4zV1RE2Ek/3QL0hBWsOFYMAaRZgvV6AWMNHh+NeKla/PGnR9T/qsHicv3pRN3tGvz9739BnieMuCiWR0mSIE3ZuM9z/qwTjSTRcl9APZy4C4RlOWTdjif4SSCQl1e8PoJiwq4oh7QE2eXbjcAJD0hQADvcIvL3zOooAmOyC8aUtdI4UI2+79F1I562FStRg8GbLy6wXhfQSrP8jgAH7wSYiaRT/YyVJHKeq0gHUWD343q1hBkNHs0ebdtjv2vQNMNnsF9FqOse33//gQerwcgHAK0IOtFIU40s42CwNEuQ5wmKIkWeyd8iRZJoJFo8E26nOfZsAjjhVvGx/BMFiD4iuyIXnxLRAAXGiSPTystuiNk02+VaaxQFQWkeI9u0LcZhxH5Xw4wjjDEALrFeL6AURfrGTA84J2MNBc1ypgu4/nvMjBSKPIXZrDCOFuO4gzEm0kk+gagAr8BhGLk//fS6I5BSitmyUkgShTTRSLMUiyJFucg4OKzMUJYZx7KmTGQo8rJTCSGZVTpwwj+NB+ow2JnsilluXMd9c4vkFAEZnGAtO54kJRCjWipopbBXCk3TYBhHHKoW9t3Wh3quVwt25VEkY0V5Ms8R1u1YJ2NF95grkEoRDGmURQZ7scQwDjgcapwn6XPar7UoihRf3F4wq5f4IQ7xdKGdVghvARj0HVADIKrxqJQ4tXkHl2WOosywXGZYLQuUZYYs1dCJDp0XH6S3BQnPghOTCZuBE8FmBIuDEwpJPNmBlblFpJAkhMWiZPtQKdRVjV7CU96/lzCdLy02FwskWsPpA85ZocwzhD2l5CkWA8Y4+e+4CkBaoyxzXGxWEsbzmUTdbBb47V9+BWsZY2RCjug6tuH6fhAcdfQxvMNgIqKzcFeKoHTFRM4SLBa5hHoWWK8KFEXGiI9WomiFAbktZ2NZ5B3nkayOlm6wnZ2Tneso4hAfJ52jAIwT7je+lmiNsiigwI71qq44DLTp8OFu52OTLi8XSJIk0gOmz36WsNZxGtHeyXGWaX+SRGOxLDGMI7RWn0NUIM8TfPFmzYHGUbTfOFoMg0HfMzF7gdq6bkQncUQuftcRu+8lDLTpsN/XeHjQKIscy1WOzabEalVguciR5Qm01gCRn5Cwe+MJgbNx4Nx1RzuQZn8VoEzw8GCy2k+wZ1FatGKzx3mQqqrCMAxoaibsKAF3l5dLJKmGi+igiFCf5QQ4YcunqcZq6RbQaSZ8XqaKaZJoDSjAjFZiaTTSlEEIx46Ngd+Zw8A7t205CrARArdtx+dt3I4eOfhqt2vw8HBAWbL8vbhcYr0uUBYZB4xFE+wCsoyJCQt4cMJpkk7RitjaWXCCIArLMWHjhaSUQp6loNUSRITDocIw9GibDvd3Oz/Bl5dLcQZM63+yjD1DWKUU8jz9vJ0KILJBRakQMN5GK1Epdy9HyyWpRp4bLJcWw1DKDmZ7r2k61BKk3bQ9xmHEMI4YDgPqusXTtsbDwwHrTYnLyyU2mwUWJbNmkjheftZspXtwIsBtJ8GJaLJicGKqaMWEDE4CMqwZ5zk5KwSHQ4V+GNC2TFhInNHV1RpppsWRHXbgJ8tYAVJcMIDjQkqzghrDQi8mKsBKBowoABDwwCs0MfHZgCZYQCloCjs9y1IsFjmGfvRurkrCPJuGw01Gw7/13YCq7rB9qrBeM3EvNgsUiwxpquEi8KMeCmERHAmEs2zO24COsK6NIxkWK1Dhr1IKWZaBVrzND4eDEHbA/cOetVhFuLxaec9QTFgvY2WhnCVsROBgljFZHYM5pwI/T1SSJmR1KRIHtrQYE9XJ+ol3hQCQhVbO9GHbL8szLJYlWmHPVd2iqSUKvx8x9AP2/Yim7rHbNXhcV7i4WODiYoGyzIW4MQFwGpyYKSCW3B5xipBzFLhZChPqwImYM0EmUisFyjIsl9z84VCh63t0XY+Hhz10wmDMxcXCO+ut9CUGIE56oKLf48XI3Yu8YJ+j/boh8saQYGYxDSC71ZkhSnBZEwVye81VER90sjyJWgEKColim7YociyXJbPmusXhUKNuO97V/Yh+qFHXHbbbGk9PB1xdrXB5uZA4Wu1NER8bG4MTMRxHNohQOHBCIDqLF4ITEPkHCTZPQbTkRXA4MGHbHvd3eySa4cbVqpCowBOE+5iM9f5mAf0VvNb+XPnITpUVDwR0xoWoQBQOL6vgZaxxEd8yY4oQ2A1x52AtNBhpUpqQpgmKIke5KFAdGhyqBk3bejB9GNjvud+32O+bSVyRY3kuuv4cODF1LPAAXf/PgRMwNpKNbqlDbEeAkADLEtYa2IPF0A9omhYfPmwZR1aExbLw+slJD9RzMjZGw9wYzmi9LyIqr69I3hDJzrWetysjCBAJGmRIdq6gK05Jk9AYo1hhsID/7M4hZg6wyFKUpQRp1zFxB+x2Bl3LcUXX1ytcugBtMf4p2mVH4ES0Gx04YYHnwYmJTIVfFp64ihfkYrmAtRb7Q4VhHFFVHd5/2CJJFN4ohUWZ83NExjqWbMwLZGx8tMPj6ef570cVJV6sovFRWOFKwk0MIcgbCrLHy6GJAmMj2zMsGCKnscpZVEqhRcEqy1yIyzt1GEY0be8BgMO+xfXNCpvNArm4xcixKEIgrNsYMVnmgIafpwBOsGieRTx4OS5zrjgOyi4YbavqhuOfDg3evd8iSTX0F4SiyCYWRZijF8pYCnrBc+VZJzmJoqQgp74oao4gDm8ZnJ8Yt4IdDuo0USG6d4GFnUAku8WddSVe0XxASiHLUuR5hsOhRlXX6Lqecdh9g65jc6i6bnF9vcZi4Y5VKMCaQFjypAoTN2O5sV0YwIkTmrZjzxQIrBUhzzMYs+QD2U0DYyz2+wbv3j1Ba4Xb27XIYXkCzQh3jhXH9i75qfx0ovpheEVpFlilIHYXRxFYY/mzCiaP94u6Fa/AwICcbONgNCtsPCgCMMzmeXMopCmJKZEiz1PsDzWapkU/DOi6Ho/DiLbr0TQ9RwNeLMJJNwvE4IQzveb24PnICSHuR8AJgE+2FUUOC/axNk2Dfhjx9FRBKY6wuLlZIUkSTOzgjxE26udzxHwRUYmCd8QAgbDEQAQTxGnGzssATxCnDbswSx/BbuDlBBm5JN81gBFO7rKywmJZgVTKh6NSDhg7VDXatoMxFodDI0BHj7YfcH25RF5k8FadU3N9F2Ys7hw44RSk58CJqC2HFVtrYK1B2/AhqKfHA7sqc42LzdKnBTgrY88oT4qCv/iziArMbFLHfq2LP4LYrjJnjpXC1ZmuLBYfcTiMsDBfR+Zf2gwsmkWBJoCSBKokcdSnbAJFAdoPDwf0PR9Wvr5ec5SC+IFBYZo+hsEqBT7X4vndVEFyBD5Ct4jEJ1syhDoaNnX6AfcPBxR5iixNsVzmR8CG3/3PARQOC39Grn7cpPE8XGRmGI/MTkR42aFOktJE+ZCdb0MIC7lBzIhKSohpgmyLQQClHEvmoOsk0dgf+DBv3w/Ybiv0/YC2G3B7s8ZqUyLVekKTc+BEXBSJrerGCgciuDmYs2AIUyCkicaiLDlfxf6Avu/R1B3u7nYoJE9SkQevzjxg3DUXlKfo+59s0jjFh5gdURTnw8qUnQAU0MQZRSLW6SIQnbxS0jlnwxqBwtjMYTZPkmMCIqudQ9uBHgAEfCgYrdJRlMJoUB1a9iR1PW6HS1x6ORtpxCfACSG3BycIQOzb9I51PA9OKENIkwTLsoQZRuwNuyT3+xbvP+yRFyn01Rppqn081llnRbQvfSD8ZytKfqeSDwdVMikGEpQsRAgE4cky1tmwcXipU0SieXBhpjLBTvmyIrP8bXIeh0TeuRWtNWudLhpwf9Bo6gbDKED7PbsKYQ0uLlb+ENR5cMJGJBI2DPjJjs/BnD5jFGS0IvAJvLFkE6ytMYwjnp4OKPIEec55Klzg3lxO+8C7SMa6uXyuvAAmnBEEPKkuQk8ZwM4IQip8DmYCec3Y2ZJGpjW+B14bhv+NFWJenYxqsZZtDcN9HCvLB4614nCZQ9X4oLHHxz1g2R98dbni6Mg5YWf5KXzkxDPHJWJwIuLJiLeRUkBR5BI4MKDrOllsexRF5vNDxVh2jI6FMNSp8vTMRn1JhL6z88KJMuvgM0tiF0csTGQ5yQq3IzA1tkU+Sgdd9ViWEJEHClxbTsa6oG7rjgkCvt0kUaAi4/BVpRho73oMg8Hj0wGGuTmur5fIUp5IJ6Osm9N47A4osWFs1i/3AE7EO9XLRkdeYidGWRboB076NQ58uv3ubsdhPRnrBVwp3vXcNkVy3QMWfxL7dfJOXHCGDLMgkXls5sTaGeC8Y0rY68mdSpENK3YrgIjNO5MGAiVCnkdhp1oIB5HVbAGdKOQqA5/5VDgcDqJAGTw9VbDGwBqD6+s18jzjxadO2OGRpnmkEfvJwREB4hgld6BMQaDERYlhGFBVnJFlu63x4cMWRZHi4nKJRKso8hFiU5+Wsc+VZ4k69gb90IGU4n8RgkJOvkF0AzcpQoSpjek8IaIBR8HazHrd9iYGJYjlMyscMUYshEUIUnMLRSkxg4zE8KYJVosFiIDDvkLbdRjHAdttjdFyFMft9QZ5kQlLcEzthO1KQXY6wnrdaTLBM/Y8i5wosgzjYoFxHNG0Lbp+wMPDHmWRIssTrJaFx8c91nvCFsZHyHqWqEor7P/wgD/+vz8hLROkZYakzJCUKdIyhc4SqFSDEgWSoGYC+aOMR+46I4oUcOSui0MrWaCSnMFhRYwMwIFjJPJ15h1yRySFVTvQKssSkFowsfZA2/Gptt2Os5oQEW6u1yiK1BPQ+Xg896Epgf1inoMTRzL1mCBaaxRlzmx4dAEDPe7u9iiXOfKMg+Nd3K+N2nEy1nvAPouoicLjj4/42//zPyEpEiRZgqTMkK8yFOsC6TJHvimwuF6guFoiX+VIygwq0zwBRBGUKKiSnLeY266x3HB2WcjFBA98+AHCCqGlriwGf46WREYrjrpfLhfM8vcHNG0LMxocdg0+0BO0IlxfrZHlqe8Yb9xguzqbNohYgTFNRHRH0gh8D5GR0qqy3swZJefiOBrsqwb393usVqVEVVK0RAiItN0p2PGJRAUIfdXh8YfHkMZUZCxpBZ0opGWK4qJEeb3E6osVFl+ssLhdYXmzRnZRIC1TkA4+S3ei/JiokSNAdonziji8Nj7crBjF4N0kuyfSuLwyxg2SnPssPZttmpZl2q7msWiFy8sV0jSZHkmMwRaHpqkADHhw4ojlTgaHmOhEhCxPsViW6McBdd2g7xhGvF+VWJQZCh0vsNmERbrLOcPmo9qvmwjrctFaTqMGC7aXfnjkc5NFgmyVo7xeYP3lBTa/usTF22ss36yRbwroPGXQQIk2HQEJLkOoA9sDMCBKk6IJnk5iGzvCep+u8/VSZA+DWX0iGijAMrHp2I23farkUJSEnyQ6mA4RKBKDE76cASdgeQ0GgkdVlAWRQp5nKIuCUwL1A6qqw8P9DhebklPGag3vG3Y4eXy0Y7pWPoGoRHIGhkSVNVDGJZ+ywGhhR8762VUdqocKTz884n32C8pNieVXG2y+u8Tl21tcfHeJxZs10mUG5YKeIyDBabNEsQM7eE086OFsYEdYiZs66R2SHWuc8qQToChgjYHZWXRC2McnPtCrFGGzWbLXKWLrbi7iqH+34r0zwj1b+u0UxSBzQx1YVuTKMkfXdZL61mK3Yza8WOZYLVUQOZGMdfkeP9v1Ro7dKmFvUUs8DqfFgG1IAbCHbkC777D9ZYcP//ALFtc/YvPtBa7+4gvc/OZLrL+9QLYuRMGaEsQf6o3Ud45Y5+9kmPWyCy+gQM5d50yj4OuVNhWzVN6xC5jRYmetJM+SgDE5XrFelwy6IJo8D6THxXpiWwVJWxux4iPWyXUsAYok31NZoOt7CaHtcfewx2ZdoshTJKk+0sjjIIPPIKrINOGLBPYaBBsFAYecxRUriLtuGNE89Gifamx/fMSHf3iP929/xu1ff4Wb377B6psLZOuSWc0M/jvyhU4UquBEcIQ11k5AIXJISdRWcAYAi0UJYw32B8tB2S0TNk21yOCcp9ErR9LuZIoIsS3rvIqunOC+k4gQrRSKsvAcw5gR1a7B3f0Oy3WBi2hxOfyLTjX6cqJCdpEEDlsLBeMPDLPZGW8NCp/dsW+ZBjta9HWHru5Qfdjj4fcf8P7vrnH7l1/h5q+/wvq7K965kSx0Hh5/UlvkpbPjKD5AFClOygafrs/S4naqCbIyzVIssICxFgc5Md7UDN9leYo01Qw9ij/508CJeAXM7wmwHycWSVCWhTj5jeR3qrDZHFDKcdAgy6NguM/Tfh37VV74AwoKxq9a5QlrWYjHD/IcQggvqQCGpsf2p0cc3u9w/893uPndO3z5N7/C7b/+Cos3G+hCslQTY7v+sJGbI+H4vCvC5E7cdQ4hEiUv2MYCVRpAKyDPUthFCTOOnEbOGBwOLR7udijyFJeXKzYvCOFYxylwYkZYH3lImPwWa8g02XF2AAAZf0lEQVRux7poiaLrMAyDz+b94W6HlURLKq0kzTvPhBeHn0NUELFJomO+4nZh2KsWfElBwcjZCLIk+9oRlutYGJABhnbA/ucnNI8Vtj894fH7e3z5N9/i8i++QHG5ACWaV7NyyS7wUXcdBLpk+zHyDp3Qho0sUY4rWmAcDeq25TRyuwrZHWfyXC6LoFecivZzYLcNO8ijTpM6YbVPzwWx0rQsS3RtL4fJGNJ8uN9jucxZFAhMS9LGc+XFKXecaRO0QZ5EK8/w8kd8ndbJR1FwHF3ZtmMOYI1FV3V4+KcPqO8P2P30iC//7bd48ze/wurbSyQF22sB64/sUAcGIHBB7hJ5jTjYrU4/iMfFY9M6QZ7nWC4NhnFE33fMAh/2yEVZKbKM++8d1q5D0XFFhP64B7iUP3NwYuoUB0OIeYblohTPEifpun844OpqibLgMB6QU7/+BKKSM2k0zRebp6y/bNwtp/gCTRaXI4QF7x47GlT3e3T7Dod3O+zf7fDN//IWV3/xJbKLMsKYeSdaxc91mLPTehWs5CaWCRWXYIjij8fGjn9LQJrwscq+H7AznH+3qjvc3+9QFCnSG43E5XdARNgYnEC8i+i8u26iuYbazpPTSMZTYwwO+wZPTxU2m9KHl/JQ/2SThr0dzN+kOHDVyVjpcpCx/MICc6Q4RSzb+l+8j3ZoOjz98IBu36C+2+Obf1fj9n/8BovbFVSaeDZshDUQgk/XRAoNCIAGzBgrJ0DwDsHDiLAQjTjBYlFgHAdUdY1hMNjvGw4/KVJsNgsopbz9fAROIAYnAmHJzddE0XETGWnOSiHLEpSLwqfXaZoBD48Vrm/YB0yKLVY1YZmfSFQIO2VFKfaPYaYITQlmhIjK68vz+41/a0NogTVsOxrU9xV+/k8/onlsUN3t8fX//GtsvruGKhI5Z0x+nbiQUzIciWGjkFNoUVrEhlWIAI7YiaCCfB1H9qJY23J457bGcnFgBKhMve5zBE5gnsZOFhQdgxPmKDSVi9YaRZ4jyzMB/dmr9PjIJwDzXEWc4nx55tBxxH6dbHQjcDQ8qkNi5IffKa7ji1yLjTq5x7+JqWrx8Lt36PYNul2Lb//Xf4WLP7+FdlECzkaMWauD04S/O6XF2Agfhq8SsULnZGc2PIwD+mGA6Qd0bY/HxwMWqxxZtua3UViEYx0UdX7OgmNwgjj0lTCTyzGgo9izVJYF2qZjUKLp8fhY4fZmxYeeZ2M4VV4QzB1pv464HJw7VZ4E08XIt1mhHQVBEN0fWB8I/tg9wSlQzNOGbsDuj48Y+xFjO+DbfsDVb79EssyEjQlh3SCjCIVYqSFn15IjoKvjZiYAFDrhuN2u6zGOFYwZsa9aPD4csFwUWAp859bD3As2YcEx+qOcrQucEasAeLeWRYYqz9APnH5hKy93WC5z5Hk6NR1PlJdhv8o1ItQ5tVOPTBq3EWds212zVgTr3CxiRcA5DcxgUL3f4Y//4Xv0bQ/Tjbj+N18jXbu4WYlzosixTsGxbt0FGx/kmtqt3qcLTmuXZSkWZYG+69F2Hbqux9NThdWqQC7AhCOcgwEIz4ETMp0Td100cTG7Vvyyv7LM0crbO5q6w8NDheurFbIsZQ3/mfJR7VcJUQkRkXxCo2MZq6BgiC3/IFGncje+f0L0uA1ZPNYynlzd7/HuP/4BphswDga3/8PXrBk7oF2RT9LhbNg4eoLlt2DMFLxDrKRQhGK5YOwCbdtx+oKBz+s8PBywXBbYbEKK9NjAOA9OuHHxijKTaMBpHZeTuCxy1FmKcRy9N+lpW2GxzENa+M8hKgCQgNwWASZ8jiCu83ZKHs+STbzbEbcTdi4P1YVGsHJjjUXzWOPd3/4EO/K9X/zbb5Fu2J1GBDZ1LHzIqY+eIIiixB01DiiYsV/vEYp8sF3fw8jE7nbMBosyQ+HyNTp9h3D6KKIXggjghBZwIjrDEwrndMjz1MOH/TCgrjo8Phx8NtPnysvifkVmekXAy1Mb5KPsACvXyCVidOgJnBJlMUHHvYIjQxIWGd7eJGxMdm27a/Dhv/4RKtVQmcbNv/kG6TLnujaSlWKfWoQIRx+xMFrfL9cRBgQCDbQWn2dZYOgHdD0nInl6OmCzKpALLuxpJ32faKZR1H8UlCiPDOBEHErmXgfG3iR+Y8cg79d5fKqw2zVYLYtnKfcC8EGCzqydmicWOCUvA+ucsd8I4D+WybJTjZ3U4WcqYJTjwSJ4212D93/3R6gsgc4SXP/VV9BFBq0QXkDgdyqzYwJ8QLizYT2mbaKdKsxCKcjRiQJdy0cnx9Fgv6vxtK2wXJUoCg7G83FDs2j6uWOdAMS5CR04MXHXCdWVVsgKfhWLyxx+OHR4eqpwc70CiuLziOrsVHfybeIZiLFgWFmCjhxKdo2CssZrfBP26z34xj8LvnZg8+xsYeDWEdYai+apwvv//COSTEOnGpe/eQOVJd6GnaclYO8OLwoXmcisPYScGiOiwznZFSHLMiwWBbo+JPza7mpcVjXy3GXrnmq7nqF6cGIa9e8VqEngOrfhwAkNQpYkKMocWdWgaQz6ju3Wuu6AzZxtv5CohEj7tWG6Hf5o4l0637mR3FUwMwQp5Mn06rlB9JIyV4eiZcA7173Ok0GKPX75v/+ApEigixSbX9+AtIIHYWfaMBkek1EOlWF7Uxk6ctcpxX+1vKMtbzL0fYDvttsaq9VCCItppB+5fWe9GRXGHrRx4DhlXQxOKMuYcJ6n4e0cB855Yb6wHrx5MVG9namJWdko/SWC1U5OOOPS9wkutsh/J8Bqru9sUlZq4AGOSRtOZ3LyiVzYKXw0ImTHmtHg8GGPX/7jD8gvFkgXOco3ayhNMIYmE8sOZq7rg8oozHn4HLNCQGsgTVMURY6madF17PPcbhtcXXXI8wROsDpZ7sbu0KsYgCf3Q6RIucXkp00mn5/NZ26ShHP8tw2/QXkcDUiffFXfSxSl4E/17MMirJKgQE4vRJuYBLKLbw8jiFhIJGeJ6Jgzu+LsTws+UfbHLX7+v/4FxdUCXy1TZJuS1wkJCYmJ6+Kc4rQE7NESdxgQZJ4oWLD8wp+iyJHnGUcojAaHQ43tjgEB1kaFSOIicwQLUnauEYfvjlV77VlYOCyDIS4hZ9/3nGNqxyf7PoP9usBl4iMQGlM2iFOKEzCFj+Yyls/LTQn4nFkUs19HJLkSydih6fH4+zv8/B++R3G1wM1ffw1dpKJUR0cwHXcQIe+PYILvU0bCcOSBDnpUAkiUYrv2ElO0fapwebGUZF0Ru4lyDYYzQ1EK+nlYqavpHOwR0RVxvqaiyD0LrirGpc/Zqs9iv05RIhdO79AfmaAYsCcTb04HNpwAFqzIZa84yf0RwnSqjWPPjgIZXlzWWHSHBnd//zOKqwWyTYmLP7sRJCx4VJz25UJOYye7S0sAkH81WexYTxOOrs/qVCIUDHbbGrttjeWSk2OGEmY7vPQv2rEzQD9IHpYBcSyxUoQsTVHkGQ6JRjOMaJoeY/85RMWxojTZ7jbcczwURHKSJvcDwlrFSzOpY6L7Jx9PtBH1wxG2vq/w7m9/wvLNBsVlieKKM366yESITuByLDj57DRmJqaMytmXSuxJEOd3KnK0bY/R9Gi7HrtdhavrZUgcMumoiC16Jk8SxTMYzh9Nj2son1aAX9k9YniG/Z7Rn0KfnMoeIiBiz010XYXr5OtBDPRZfbk/vk6T+rPr82c55SJqAySK089bvPvbH7H9/h62H6QvsRIU9c1xIqerKQEn3G9+wvkZScLwYZYlUEToe06/XldddNwjtO/n0C19ip4F2RBSx110uoBSoS2lgCxPkeUplFISJ3yebB8hKvFLZ92ES9JI912pAE741zL7a+Gv0vM6LgGlmhJTzZ/3zLX580Qp6WsOj/nw//yE6sOe2Zu0ryIiTj8H3UHLGF32FO6rm2iG79zJdX4RUIe9vJdtspjnf532PVm08SJwcxB9931QPvg7kfT01p6n6otS7ky99UoEfSRjgROBZ+e9NApK4MSZXHZ1nEPezpQtw889xpMB3qoCTDxU+PB3P2Hz9gr5pkS2LvzLAz3ncx4TEHxwuCwMl1PCIqBQDjtOU9ZGD5XGOHJqvf2+QdsOknFN+oIQNOdZrc+64nSh+Fysn3WvSPFLIvi5WpJz5lmKfhjiM1OfRlTPar3rTcozmqvz/8NS0HRnC2HShg0OADuDFj1MeMJ15wENZ0X45WVghgHbHx/x/j//iNVXl7j6TQ6VqMmLjSzgT+JJIOLEXUfKWTfME13IqcOEszRF3/U+aUhVNVitck4VH03UyWOILmojtqF976eKlJOvnAEuRV5kqJsWkY15VJ5nv0CQlSflHWZyLbANzO+lc23E8hUn2pixo7mMVTN5Lhpvu29x/4/vcf+Pv6Db1yAJN3Vy0smxiQxF1C84URHknOtLlibIRb4ZY+W9AJwECxTuDYJVFryX0fAE8fLX9cf1z/2L5i1NFL9q2y2cM7v1ZeyXaAo2+PiiqJM+mlBu8mwIsw7IbzE44e6btIFn2pA6NrrN/S6s2xqDw/sd7v7+F1z/5g3yTclvbbYQQ58rWsQEDnaWz0guO9gdSlKaX2JbFmxijAOnrnUsuCwz3++TxxAV/EkBS8+BE6EOgYPPreas4MFJf7q8gP1KWgA7Y50W8GwQc6v0BOucs+wIlVJgf+3EZ4vwjNPghGK/qprWYXuZ6wxNj+2/3OPxd++x/uYS+WUZgsMVQloCES/z4HCPERv4PMfGQN5+wQFibcfJOaqK08ev14VXZkIiaD+h/BwV4n5fCk4AgNKchNPlgzpXXnbqjUiUmGiC516aSHE68rCcc4obC5yQl04WHytOs1ufXVyMHNQfDrj/x3e4/ssvka5YtsaRDiGADXBZxF0khU9LoHkGXdJqRfCAQFXV6Ht+/85+3+Dmdo2EtCcEzXcqX41G+3JwQiuSV7Gls3an5eXnU71cptC/WCI7VmmFdU1YI0002dlDQnseHw7XJiz9lAwx0e8guBAb0T/Rtz22f3jA0/d3WH19gfyiBGCDLIvHYqb4cAxQsEZsJdssv8gwz/llub2w4Lru0Hc9R0WItn3yfTqfBU7wNfdWLnpGGzr/kyOKIonQnyk8+ozSE133is4zoIK7z7/7Tc3rP69kTdoQRSO0AcAaVB/2ePynD2juD4AxMxvRV436gdk94Zpy3dXE+Y/k3TnGWNRNj7YdeRHIijl6zlxPcAqa3Oz6wv/cmOA7qbWS4LNo58zKy45dxO40p49jxjojNmjAPwVTI8Zzz/hb4WzdUOfokNU5swhOLpuoDb5qjUFf93j6wwP2Pz1i+dUG6SILtqg/cg+E7Gc4cqyDgq1q5Lc0Y+iOtWCDtuW3dxhj+P1wmmBG19FIRh7t3siGheMgVvqEyb1aIvn5eOlpur04Qp8F+Us8LI5IFJFHwb2Q3TvFJ/qDc6LaSR0Ob3kmyv9IBwmOh1hqGWNQ3e2x/eEBN3/1BtkiC7sa8NH6zontT6+7NH2I0hKQ2LfEGdbyLIHWDN31nbysfrBIM3m6yO+g8Z+wXeeEpbBL5+diXcZytyhPlY/mJnRQnnXaHFhsWRUjRnOl5xkPy0kvDSZKTwwl8JVZHXffnGPMFCc/lwPQ71vsf3xCfVehvF6DUtG5LSZZ00hk3Nxd57RhAjg4wLCf1b0jth/4vXZV1aHvB5RIw4sgQBwW6lnvlEhzwrq3gYTTfEGRGhUD/Fqpc2bqx7HfiMF7xSkGC6b/nHxzOxzzG5i1qfA9AP+RzIna4Gchkpvk2/a3HslY+LahCKSBsR+wf7fF/uctRgH6mRVS9Nnt3mhsCLRw4ISTczrh96zyO+mAcbRoGva1ulXs+uje/BwIG/5O5i9c9TTw/ZI+aK2PUb6ovPgkOWf9PDY//C4hz18QB56RfYZlx+3M8ORwyOoTzCIKv/mdagMrbx4q7H58QL/9Gtky87n/2RMSUusR8e51YTSTnerinCicVHMyjtPTdajbHqMB0hQIAXZuTYvtSsSENzFxAjgxt1XdX6U4Ha5y9U+Uj+d80CxPbeQUFwtnyn593E3on59e4tPjkzpzpccHnp1zihPcu8zPLi7fBl8jwaAVDIwFurrH/qctmocDll+uOMaHpnkmXL5/okjciO3o0hL4uDZjkab8tkZH1L4f0TY9zGhAqUYcHuPz5SuaJYL2E849l7S3lgI4EbNn95L7c+UkUXWiMY4GaSFnIsMmRByaMkFy3I442pkBMYrrkKyD51Gn2e6XIwwT5WlC2KBsTfvKoap2NKgfDqjvDjC9QZImvKxM7JyW1hTOpiUICUUApfm97For9D2/crQTlInTz0cJJAWYdy8OZNY826k8m3AhMT4DXIQ2KSLOA2EZkHgRUZNcYaxMSEMHgn/HSyQW3IluiAJDBE63DplXERCBjYmRTUEn4voUNjnB48pw7rCJXOcVMcGjbfQb4GV3rJtYYbXtvkX1YY+x6ZEusyCzBOmY5GKSjk7SEkSTS+Bdk6QaWsZtjfUvA3ZzEkflWwd8AN6xPi0u83ZguT7XskyVJkKi+T6VHKtFJ4ma5gmafY+0SJEvMnR1zwCEmzcHTMTmiet4/CqwiE78e+QAsEd3nL4W14m1lvn97iYbvhAQCCTsbGh6VHcHdIcO5fXCe3Vc+OkkF5PkqvBpCcj1RogMfuMkv5yBw1nG0aJvmahsAETIFUJ4KstW1+Gp7OTdOzd13MaxSLRCmijAQqIKp+Wk9lssU5jRIF/kWN9uWJlQCqTJe21c9IJDl0JEhLsWIhPi31wUhFLzOgpH0QyujprXORUJcfxvGqXBkRamG1HfHdA+Vf4VJaS8Qh9FOkRjJfLREV6TlTrueIZ7u7G1hs+V9kaIiIkG6zR9pRC1j4//hehWICyLFJpYri7W+RH9TrPfLOHMoUrh8utL3P94z51TxzLTBViKiR7Wig12any/ByfEfRfrwrGHRRqf1pkoTvyMiVY+s3VDI2E1G2PQbGs0DxXsMEJniY+O5N+Dlnkui3iclkCBDzMlaXiz8TAYdD1HJyhyu5wYpZJZsgDIJ/twnQ8K1TE4AZblirAsM/lqkRXHJDyjKCm6/+PW7h9aXP/qGu9//x6791uQUhBj6XjeMWGUgYjuhNsp1nqyjejKvI6d3ecjEqMWJgA/whKP+tUfetSPNcZuQLrIeUiiBTMrlsMlBA/p+XfszNISgNheTZOALA2SVoCjFoHJi4Jho94ScIawp1ixsRbLIsUiSzCOBqubEuqEpnQWfFjfLFhmpBpf/9XXUP5lPVMQ3X8+Gx1xfN0DCJ/QxkmgX03rnwb+MbkXAMZuQLdtMLSjDCkCG5QbI06wQccKSRYCX9daIUuVsG2LfjDo+tEHh8V1IJ8nep+w/VPghOsHCEiUwtWyEIULWF+XJ2l3lqhpltD6psTQj7j69grf/OtvvKFOkVw8jiycy7bja8rJT30qOvF0XRXJXX+fPvNcPZXJvg3NSpwZR/RVh7EdZDcALoqP5WQkS1Ug7OSzUIMUmxVJqqGUFtjRYOhHTvkTy2KEOh4Vi9rz8jpaYH4RA7halyizBGY0WF+XSLPkaJcCHwEfLr9c0x9/d2+HbsQ3f/0Nhm7AL//4C68gTQCdztcAYm3zVBq7UzI2PopB7n4f8n+q30HGBsnNz5icoz0h25Vle3eoe4zNwJdT8ogRTDjxBsztVkzzRIhGrDS/uE9Hmq5xx0xc9xWxf9WZdW4os2h8//ZoC58FRgHYLAtsypRt50zj+uv1SYICL0gP8MXbC/z8u3tYC7z9n96iWBb48b/8iL7peAU5BCdGkCLj35xQeuaQnw9nsbNDx5iFxEyGMQX0p4vr1HGQ8Fxrgb7qMdQtYA0UdAhhEXmpRI5Z4CiLOBCJaSs7XAsngJzHMZbz/3p26tplgnvTXMCImLAw/B5ZAw6duSgzlFkiwRAWt9+sn6XZR4mapJq6ZrDv/+UR42Dw5W+/xOp2hZ//4Wc8/HCPvhskk4r1OZCcwe4+B63U3YPon539g2/L53xw/+L7jJG/VvInRPcYE+r4f5z92loDGi1ayc9kRwEdnDlIJCAJPFt03MehGcG8QLQ4RV6PFkRW8vc6e1bo73SrWXySI7A/eCxsv9QJllnKQIO44G5/tUG5zM7u0hcRFQCyIqFxMPbuhyc0hx6LywX+/N/9OarffoWnnx+xfb9DX/cYugFjP3IeJLBssaOd5Ny37tqMIJgTwUb3jBERLTyR/GIy/Movvg7AGsl05g4oh7aM9KXYFFBagUDQ5MwMPkUeXr8icKDhoGpLFPogJo9VvLvKIsVykWPoR44NThNo2ZleP5eFYAVftjBMdMlprK0FQSFJFVKlkSje9eNokZUJLt4ssVjlzxI0LK9PKPvH2j69qzD2I0+KJFoYhgGmNzCS2Mpr5oD/cNKpEC336co/fc/p++SB1k4fPf8Sm0RaIckT6Pw4Mu9UP3xTR2MTriT2qUsmojXJ60hUPAU48SX0KeBVAJiF60Rh88USm+vyxbT6ZKICwDga21Y9Dg8N+qbnFSsrOMiQP+0pZ6u8qK2X3BS4wp9cnJkSjd2LohcWN3dKLAKVKmxuFsjKBEmqP2kGP4uocRn60bZVzx4DTZK587V8auE3bLBoKZYZdPKMF/y1vJbX8lpey2t5La/ltbyW1/JaXstreS2v5bW8lv+u5b8BsQXCIMF+G3IAAAAASUVORK5CYII=';

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

        this._onStopRequested = this._onStopRequested.bind(this);

        runtime.on('PROJECT_STOP_ALL', this._onStopRequested);
    }

    writeLog(args) {
        const text = Cast.toString(args.TEXT);
        log.log(text);
    }

    isClientConnected(args, util) {
        return this._isClientConnected;
    }

    // MQTT BROKER CONNECT GORRU
    connect(args, util) {
        let ctx = this;
        ctx.clientID = args.CLIEND_ID + "_" + this._uuidv4()
        this.client = mqtt.connect({
            hostname: args.BROKER,
            port: args.PORT,
            clientId: ctx.clientID,
            protocol: args.PROTOCOL,
            username: args.USER,
            password: args.PASSWORD
        });

        this.client.on('connect', function () {
            util.mqttClient = ctx;
            ctx._isClientConnected = true;
            log.log("client connected with id: " + ctx.clientID)
            ctx.client.subscribe('scratch_presence', function (err) {
                if (!err) {
                    ctx.client.publish('scratch_presence', ctx.clientID)
                }
            })
        });

        this.client.on('message', function (topic, message) {
            log.log(message.toString());
            ctx.mqttMessages[topic] = message.toString();
            ctx.messageReceived = true;
        });


    }

    onMessageReceived(args){
        let rtn = this.messageReceived && (!this.lastHat);
        // if(args.TOPIC){
        //     rtn = rtn &&
        // }
        this.messageReceived = false;
        this.lastHat = rtn;
        if(rtn) {
            log.log("mqtt message received: " + rtn);
        }
        return rtn;
    }

    _onTargetCreated(){
        // this.mqtt
    }

    _onStopRequested(){
        this.disconnect()
    }

    disconnect (args, util){
        if(this.client){
            this.client.end(true);
            this.client = undefined;
        }
    }

    subscribe(args, util) {
        let ctx = this;
        let topic = args.TOPIC;
        this.client.subscribe(args.TOPIC, function (err) {
            if (!err) {
                ctx.client.publish('scratch_presence', "subscribed " + ctx.clientID + " to topic: " + topic);
                ctx.mqttMessages[topic] = "no message";
            }
        })
    }

    publish(args, util) {
        let topic = args.TOPIC;
        let message = args.MESSAGE

        this.client.publish(topic, message)
    }

    getMessage(args, util) {
        let message = this.mqttMessages[args.TOPIC];
        if (message && message.length > 0) {
            return this.mqttMessages[args.TOPIC];
        } else {
            return "no message";
        }
    }

    getFieldFromJson(args, util){
        if (args.MESSAGE != "no message" || args.MESSAGE.search("{") == 1){
            let object = {};
            if(typeof args.MESSAGE === "object"){
                object = args.MESSAGE;
            }
            else {
                try {
                    object = JSON.parse(args.MESSAGE);
                } catch (e) {
                    log.log("error parsing json (is a json source?)"); // error in the above string (in this case, yes)!
                }
            }

            let field = args.FIELD;
            if (object.hasOwnProperty(field)) {
                let fieldValue = object[field];;
                if(typeof object[field] === "object"){
                    fieldValue = JSON.stringify(fieldValue);
                }
                return fieldValue;
            }
        }
        return '';
    }

    takePicture(args, util){

        let pictureName = args.PICTURE_NAME;
        let clientName = args.CLIENT_NAME;
        let cameraID = args.CAMERA_ID;
        let site = args.SITE;

        let topic = `${site}/camera/${cameraID}/shutter`;
        let message = `"fileNamePrefix":"${pictureName}", "clientName":"${clientName}"}`;

        this.client.publish(topic, message)
    }

    dimScreen(args, util){

        let cameraID = args.CAMERA_ID;
        let site = args.SITE;

        let topic = `${site}/camera/${cameraID}/setting/dim_screen`;
        let message = "";

        this.client.publish(topic, message)
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
                    filter: ['stage'],
                    opcode: 'connect',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'mqtt.connect',
                        default: 'connetti al broker [BROKER] sulla porta [PORT] con ID [CLIEND_ID] (protocollo [PROTOCOL], user [USER], password [PASSWORD])'
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
                        PROTOCOL: {
                            type: ArgumentType.STRING,
                            menu: "protocolParam",
                            defaultValue: "wss"
                        },
                        USER: {
                            type: ArgumentType.STRING,
                            defaultValue: ""
                        },
                        PASSWORD: {
                            type: ArgumentType.STRING,
                            defaultValue: ""
                        },
                        CLIEND_ID: {
                            type: ArgumentType.STRING,
                            defaultValue: this.clientID
                        }

                    }
                },
                {
                    filter: ['stage'],
                    opcode: 'disconnect',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'mqtt.disconnect',
                        default: 'disconnette il client dal broker'
                    })
                },
                {
                    filter: ['sprite', 'stage'],
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
                    filter: ['sprite', 'stage'],
                    opcode: 'onMessageReceived',
                    blockType: BlockType.HAT,
                    text: formatMessage({
                        id: 'mqtt.onMessageReceived',
                        default: 'quando ricevo un messaggio MQTT'
                    }),
                    arguments: {
                        TOPIC: {
                            type: ArgumentType.STRING,
                            defaultValue: ""
                        }
                    }
                },
                {
                    filter: ['sprite', 'stage'],
                    opcode: 'publish',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'mqtt.publish',
                        default: 'pubblica sul topic [TOPIC] il messaggio [MESSAGE]'
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
                    filter: ['sprite', 'stage'],
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
                    filter: ['sprite', 'stage'],
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
                    filter: ['sprite', 'stage'],
                    opcode: 'getFieldFromJson',
                    text: formatMessage({
                        id: 'mqtt.getFieldFromJson',
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
                },
                {
                    opcode: 'takePicture',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'TechLAB4KidsBlocks.takePicture',
                        default: 'scatta la foto [PICTURE_NAME] con la fotocamera nel sito [SITE] con id [CAMERA_ID] e id client [CLIENT_NAME]',
                        description: 'questo blocco usa una fotocamera comandata da messaggi MQTT.'
                    }),
                    arguments: {
                        PICTURE_NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: 'nome della foto'
                        },
                        CAMERA_ID: {
                            type: ArgumentType.STRING,
                            defaultValue: 'identificativo della foto camera da usare'
                        },

                        CLIENT_NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: 'nome del client (non obbligatorio)'
                        },

                        SITE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'nome del sito dove si trova la foto camera'
                        }

                    },
                    showAsVariable: false
                },
                {
                    opcode: 'dimScreen',
                    blockType: BlockType.COMMAND,
                    text: formatMessage({
                        id: 'TechLAB4KidsBlocks.dimScreen',
                        default: 'oscura lo schermo della fotocamera in [SITE] con id [CAMERA_ID]',
                        description: 'questo blocco usa una fotocamera comandata da messaggi MQTT.'
                    }),
                    arguments: {
                        CAMERA_ID: {
                            type: ArgumentType.STRING,
                            defaultValue: 'identificativo della foto camera da usare'
                        },

                        CLIENT_NAME: {
                            type: ArgumentType.STRING,
                            defaultValue: 'nome del client (non obbligatorio)'
                        },

                        SITE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'nome del sito dove si trova la foto camera'
                        }

                    },
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
            }
            ,

            menus: {
                protocolParam: {
                    acceptReporters: false,
                    items: [
                        {
                        text: formatMessage({
                            id: 'mqttClient.protocols.ws',
                            default: 'ws',
                        }),
                        value: 'ws'
                    },
                        {
                            text: formatMessage({
                                id: 'mqttClient.protocols.wss',
                                default: 'wss',
                            }),
                            value: 'wss'
                        },
                        {
                            text: formatMessage({
                                id: 'mqttClient.protocols.mqtt',
                                default: 'mqtt',
                            }),
                            value: 'mqtt'
                        },
                        {
                            text: formatMessage({
                                id: 'mqttClient.protocols.mqtts',
                                default: 'mqtts',
                            }),
                            value: 'mqtts'
                        },
                        {
                            text: formatMessage({
                                id: 'mqttClient.protocols.tcp',
                                default: 'tcp',
                            }),
                            value: 'tcp'
                        },
                        {
                            text: formatMessage({
                                id: 'mqttClient.protocols.ssl',
                                default: 'ssl',
                            }),
                            value: 'ssl'
                        },
                        {
                            text: formatMessage({
                                id: 'mqttClient.protocols.wx',
                                default: 'wx',
                            }),
                            value: 'wx'
                        },
                        {
                            text: formatMessage({
                                id: 'mqttClient.protocols.wxs',
                                default: 'wxs',
                            }),
                            value: 'wxs'
                        },
                    ]
                }
            }
        };
    }





}

module.exports = ScratchMqttClientBlocks;
