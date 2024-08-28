/** ******************************************************************************
 *  (c) 2018 - 2024 Zondax AG
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 ******************************************************************************* */

import Zemu from '@zondax/zemu'
import {defaultOptions, models, PATH} from './common'
import IronfishApp from '@zondax/ledger-ironfish'

jest.setTimeout(4500000)

describe('DKG', function () {

    test.skip.each(models)('can start and stop container', async function (m) {
        const sim = new Zemu(m.path)
        try {
            await sim.start({ ...defaultOptions, model: m.name  })
        } finally {
            await sim.close()
        }
    })

    test.each(models)('get identity', async function (m) {
        const sim = new Zemu(m.path)
        try {
            await sim.start({ ...defaultOptions, model: m.name })
            const app = new IronfishApp(sim.getTransport())
            const respIdentity0 = await app.dkgGetIdentity(0)
            const respIdentity1 = await app.dkgGetIdentity(1)
            const respIdentity2 = await app.dkgGetIdentity(2)

            expect(respIdentity0.returnCode).toEqual(0x9000)
            expect(respIdentity0.errorMessage).toEqual('No errors')
            expect(respIdentity0.identity?.toString('hex')).toEqual("72510338227d8ee51fa11e048b56ae479a655c5510b906b90d029112a11566bac776c69d4bcd6471ce832100f6dd9a4024bd9580b5cfea11b2c8cdb2be16a46a2117f1d22a47c4ab0804c21ce4d7b33b4527c861edf4fd588fff6d9e31ca08ebdd8abd4bf237e158c43df6f998b6f1421fd59b390522b2ecd3ae0d40c18e5fa304")

            expect(respIdentity1.returnCode).toEqual(0x9000)
            expect(respIdentity1.errorMessage).toEqual('No errors')
            expect(respIdentity1.identity?.toString('hex')).toEqual("7232e78e0380a8104680ad7d2a9fc746464ee15ce5288ddef7d3fcd594fe400dfd4593b85e8307ad0b5a33ae3091985a74efda2e5b583f667f806232588ab7824cd7d2e031ca875b1fedf13e8dcd571ba5101e91173c36bbb7c67dba9c900d03e7a3728d4b182cce18f43cc5f36fdc3738cad1e641566d977e025dcef25e12900d")

            expect(respIdentity2.returnCode).toEqual(0x9000)
            expect(respIdentity2.errorMessage).toEqual('No errors')
            expect(respIdentity2.identity?.toString('hex')).toEqual("72b1d21580d6905b99af410bb19197bcbbb1f64c663381534de0e4ec969bad4a38779b7f70f21ba296a4a8a47a98bb704666cb1ee5030a501ec42206a45ecaf062e0b6e85ca7b78577b92d89069cd01e97e1f7f1e2674b6adcd8b2bab618a221c8ee5ce37c9cca2ad9ff541f3dfd935d81bdf669cb4a4cac5fd7dba05aabcd7801")

            if(!respIdentity0.identity || !respIdentity1.identity || !respIdentity2.identity)
                return

            const identity0Round1 = await app.dkgRound1(PATH, 0, [
                respIdentity0.identity.toString('hex'),
                respIdentity1.identity.toString('hex'),
                respIdentity2.identity.toString('hex')
            ], 2);

            expect(identity0Round1.returnCode).toEqual(0x9000)
            expect(identity0Round1.errorMessage).toEqual('No errors')

            const identity1Round1 = await app.dkgRound1(PATH, 1, [
                respIdentity0.identity.toString('hex'),
                respIdentity1.identity.toString('hex'),
                respIdentity2.identity.toString('hex')
            ], 2);

            expect(identity1Round1.returnCode).toEqual(0x9000)
            expect(identity1Round1.errorMessage).toEqual('No errors')

            const identity2Round1 = await app.dkgRound1(PATH, 2, [
                respIdentity0.identity.toString('hex'),
                respIdentity1.identity.toString('hex'),
                respIdentity2.identity.toString('hex')
            ], 2);

            expect(identity2Round1.returnCode).toEqual(0x9000)
            expect(identity2Round1.errorMessage).toEqual('No errors')


            if(!identity0Round1.publicPackage || !identity1Round1.publicPackage || !identity2Round1.publicPackage)
                return
            if(!identity0Round1.secretPackage || !identity1Round1.secretPackage || !identity2Round1.secretPackage)
                return


            const identity0Round2 = await app.dkgRound2(PATH, 0, [
                identity0Round1.publicPackage.toString('hex'),
                identity1Round1.publicPackage.toString('hex'),
                identity2Round1.publicPackage.toString('hex')
            ], identity0Round1.secretPackage.toString('hex'));

            expect(identity0Round2.returnCode).toEqual(0x9000)
            expect(identity0Round2.errorMessage).toEqual('No errors')
        } finally {
            await sim.close()
        }
    })
    
    describe.skip("participant 0", () => {
        test.each(models)('get identity', async function (m) {
            const sim = new Zemu(m.path)
            try {
                await sim.start({ ...defaultOptions, model: m.name })
                const app = new IronfishApp(sim.getTransport())
                const respIdentity = await app.dkgGetIdentity(0)

                console.log(respIdentity)
                console.log(respIdentity.identity?.toString('hex'))

                expect(respIdentity.returnCode).toEqual(0x9000)
                expect(respIdentity.errorMessage).toEqual('No errors')
                expect(respIdentity.identity?.toString('hex')).toEqual("72510338227d8ee51fa11e048b56ae479a655c5510b906b90d029112a11566bac776c69d4bcd6471ce832100f6dd9a4024bd9580b5cfea11b2c8cdb2be16a46a2117f1d22a47c4ab0804c21ce4d7b33b4527c861edf4fd588fff6d9e31ca08ebdd8abd4bf237e158c43df6f998b6f1421fd59b390522b2ecd3ae0d40c18e5fa304")
            } finally {
                await sim.close()
            }
        })

        test.skip.each(models)('round 1', async function (m) {
            const sim = new Zemu(m.path)
            try {
                await sim.start({ ...defaultOptions, model: m.name, startTimeout: 600000 })
                const app = new IronfishApp(sim.getTransport())

                const respIdentity = await app.dkgRound1(PATH, 0, [
                    "72510338227d8ee51fa11e048b56ae479a655c5510b906b90d029112a11566bac776c69d4bcd6471ce832100f6dd9a4024bd9580b5cfea11b2c8cdb2be16a46a2117f1d22a47c4ab0804c21ce4d7b33b4527c861edf4fd588fff6d9e31ca08ebdd8abd4bf237e158c43df6f998b6f1421fd59b390522b2ecd3ae0d40c18e5fa304",
                    "7232e78e0380a8104680ad7d2a9fc746464ee15ce5288ddef7d3fcd594fe400dfd4593b85e8307ad0b5a33ae3091985a74efda2e5b583f667f806232588ab7824cd7d2e031ca875b1fedf13e8dcd571ba5101e91173c36bbb7c67dba9c900d03e7a3728d4b182cce18f43cc5f36fdc3738cad1e641566d977e025dcef25e12900d"
                ], 2);

                console.log("publicPackage " + respIdentity.publicPackage?.toString("hex"))
                console.log("secretPackage " + respIdentity.secretPackage?.toString("hex"))

                expect(respIdentity.returnCode).toEqual(0x9000)
                expect(respIdentity.errorMessage).toEqual('No errors')

                // Cannot compare as the values change every time the round 1 is run (random values are used)
                //expect(respIdentity.publicPackage?.toString('hex')).toEqual("72510338227d8ee51fa11e048b56ae479a655c5510b906b90d029112a11566bac776c69d4bcd6471ce832100f6dd9a4024bd9580b5cfea11b2c8cdb2be16a46a2117f1d22a47c4ab0804c21ce4d7b33b4527c861edf4fd588fff6d9e31ca08ebdd8abd4bf237e158c43df6f998b6f1421fd59b390522b2ecd3ae0d40c18e5fa3048700000000c3d2051e022a2f0d7393d18c1a4ce1ad488609048d32c789615f35f7dd0712fe52a3da8c3be605bb1c4420324ba58a8f0a805e157c5748385d7774a0b238270386d58c3e9c4010c8675c50a0a5f1614474490b3f6da2d3847f4af4f80b4f8426cd2854926fa13557b349806bb3d68c04ac871765182373c208e52efb382f4e3f88552d5f8f04980000001dd493472808f4f10c5b3f2a4d5258083ddaebcf78e2e35a71dcb360575d2711f6a7d7e0c90a6c61500460d7b1a03c0c0200000020000000bbd8f89dad7d0268af0409a4cb77e14a5f1ab116af96bbaa5d9163ff2e907a49a8cbb2dfd9fef57403f53a991e517109fe4710c538ec75cf63915c9e0f699183b148e64d869b2fbe17781f95f69edcacf947ce0b04a8ce0f38b4e8e2a06b366983492b614ddbd6c3")
                //expect(respIdentity.secretPackage?.toString('hex')).toEqual("34d589b31b5d64fde9ebcfbd71de73c96dc9ed6b66d2fec37876b0d17351ca0d5a33d2af0fd10c647aac9cd23c294fcd01000000ac000000645336c0ce7b48064582c2b0c89606fd5f107974711323d344c36be3e41832cdd1748b78224a85a1818daa1227f8610a2ec9f1caac2373d20d34c79622ea9b48339ef70e4f8013ec843bbd5f206b2fe73b3992cc49490ea36cf36068a11deaafca78c3854a2eecda6ac0083e6b6dc510e3b77a07104c630e2a63c79c39365ddb364858cc491a7ce34be0e5783b690321d3b36d6d8f22550b0d1bd943f6fde71ced2f38b85c7746a91ca641de43e24bf71aec3fd04dd4bfc49e0b08591891e8c6bb98319977f386c8e778d812")
            } finally {
                await sim.close()
            }
        })


        test.skip.each(models)('round 2', async function (m) {
            const sim = new Zemu(m.path)
            try {
                await sim.start({ ...defaultOptions, model: m.name, startTimeout: 600000 })
                const app = new IronfishApp(sim.getTransport())

                const respIdentity = await app.dkgRound2(
                    PATH,
                    0,
                    [
                        "72510338227d8ee51fa11e048b56ae479a655c5510b906b90d029112a11566bac776c69d4bcd6471ce832100f6dd9a4024bd9580b5cfea11b2c8cdb2be16a46a2117f1d22a47c4ab0804c21ce4d7b33b4527c861edf4fd588fff6d9e31ca08ebdd8abd4bf237e158c43df6f998b6f1421fd59b390522b2ecd3ae0d40c18e5fa3048700000000c3d2051e022a2f0d7393d18c1a4ce1ad488609048d32c789615f35f7dd0712fe52a3da8c3be605bb1c4420324ba58a8f0a805e157c5748385d7774a0b238270386d58c3e9c4010c8675c50a0a5f1614474490b3f6da2d3847f4af4f80b4f8426cd2854926fa13557b349806bb3d68c04ac871765182373c208e52efb382f4e3f88552d5f8f04980000001dd493472808f4f10c5b3f2a4d5258083ddaebcf78e2e35a71dcb360575d2711f6a7d7e0c90a6c61500460d7b1a03c0c0200000020000000bbd8f89dad7d0268af0409a4cb77e14a5f1ab116af96bbaa5d9163ff2e907a49a8cbb2dfd9fef57403f53a991e517109fe4710c538ec75cf63915c9e0f699183b148e64d869b2fbe17781f95f69edcacf947ce0b04a8ce0f38b4e8e2a06b366983492b614ddbd6c3",
                        "7232e78e0380a8104680ad7d2a9fc746464ee15ce5288ddef7d3fcd594fe400dfd4593b85e8307ad0b5a33ae3091985a74efda2e5b583f667f806232588ab7824cd7d2e031ca875b1fedf13e8dcd571ba5101e91173c36bbb7c67dba9c900d03e7a3728d4b182cce18f43cc5f36fdc3738cad1e641566d977e025dcef25e12900d8700000000c3d2051e02c03ceb790f14638f22873dac94f361f9b3ed01184c726938d7d38e6fa0297553d4ef223ee64b0b2187e8bdf5bd4baebf5a3f0af933a345c4ef3089399597c69840f97695ac22663c98d826ecda39148a73b970b8b52136dff464b1fb813a9b316cd63bc2745eb16909289031b44394f3f1d87ea3582a07d4ffb1f194fc9c634c0798000000f035712ae878d677524c39acba7824b40f82f84fa4317f1fb4569580674b5574da4aa01850dcd207dcdc80abc918035702000000200000003b9588bc7e18b72dc4b1c18b3fed707ed8bf7b604c8b9ed4e5917ae13a7f14801f6d264c11b7ca84794b168166854d41630bf41b911acb677db232be3517bd78f900f9ef8983f95006d6292348360f7855db747b82caef003044b1a3c81c965e83492b614ddbd6c3",
                    ],
                    "34d589b31b5d64fde9ebcfbd71de73c96dc9ed6b66d2fec37876b0d17351ca0d5a33d2af0fd10c647aac9cd23c294fcd01000000ac000000645336c0ce7b48064582c2b0c89606fd5f107974711323d344c36be3e41832cdd1748b78224a85a1818daa1227f8610a2ec9f1caac2373d20d34c79622ea9b48339ef70e4f8013ec843bbd5f206b2fe73b3992cc49490ea36cf36068a11deaafca78c3854a2eecda6ac0083e6b6dc510e3b77a07104c630e2a63c79c39365ddb364858cc491a7ce34be0e5783b690321d3b36d6d8f22550b0d1bd943f6fde71ced2f38b85c7746a91ca641de43e24bf71aec3fd04dd4bfc49e0b08591891e8c6bb98319977f386c8e778d812"
                );

                console.log(respIdentity.identity?.toString("hex"))

                expect(respIdentity.returnCode).toEqual(0x9000)
                expect(respIdentity.errorMessage).toEqual('No errors')
                //expect(respIdentity.identity?.toString('hex')).toEqual("0104a42cd833e21478268f44bf933f13359a0936e477be88fb9f46b7876f81046548d3d0c9d0f27b08e5f43e710c330bc35601000000ac0000004acbe50f5c3a245d6539611a54d8d5a5ddfd8ee1124341c5e8226b7f8b7604fc39da3dec18e569a077033ed5ce16c6c9264b253d3fd82ee3199dce54c020a729fe61454400cf85438b93d7b81483e74887d6ca9adb699faf435135b6cb3b05ac5724cc8758eb701de3ec58eec276950824f6ef20ee52bcf55b42dd4a9358fe0a685c595259bbd21f00ef6e632d86c08e99d96b1d45bfaa1cea5301bc766229fdee093383b791ec7b6d8499cf68d0f6fa30a7d09583475bcbcf81936b27e1386b7e65485911020000bff4c17a01b072510338227d8ee51fa11e048b56ae479a655c5510b906b90d029112a11566bac776c69d4bcd6471ce832100f6dd9a4024bd9580b5cfea11b2c8cdb2be16a46a2117f1d22a47c4ab0804c21ce4d7b33b4527c861edf4fd588fff6d9e31ca08ebdd8abd4bf237e158c43df6f998b6f1421fd59b390522b2ecd3ae0d40c18e5fa3048700000000c3d2051e0256298dd7a68d125d01d70f2b19e9d6a3288157788943d34740730232ffd910e12c330a83b4eba848e78b8d991d4b3903e8443b45be20433b22351974c76b2ba7402f28331350958c27ea178fbad9474a6709ecb6b31e569e9c826e581e64cb343d0f28d560883e00897181305045227339875d9af4d4f7193205815076162ab90b980000009692e0f0e35c9755af10430df138d86ad30763b22769f71d50af19209acecc56b3c8e280ace88f57a7961b12072fba9e0200000020000000f0376ab96314acb6b5dcdc236f9cbfea09ef4fae196479ecf8c2a416fa14509b915d530804997274bd4e866c743e4872f57f5ed02dbaaa712d7c3505b93f533ff91f56fb4b7b741ddee6ef4ccafde4858e748336539f64554f804c9675498025749453ce1be5b689")
            } finally {
                await sim.close()
            }
        })
    })

    describe.skip("participant 1", () => {
        test.each(models)('get identity', async function (m) {
            const sim = new Zemu(m.path)
            try {
                await sim.start({ ...defaultOptions, model: m.name })
                const app = new IronfishApp(sim.getTransport())
                const respIdentity = await app.dkgGetIdentity(1)

                console.log(respIdentity)
                console.log(respIdentity.identity?.toString('hex'))

                expect(respIdentity.returnCode).toEqual(0x9000)
                expect(respIdentity.errorMessage).toEqual('No errors')
                expect(respIdentity.identity?.toString('hex')).toEqual("7232e78e0380a8104680ad7d2a9fc746464ee15ce5288ddef7d3fcd594fe400dfd4593b85e8307ad0b5a33ae3091985a74efda2e5b583f667f806232588ab7824cd7d2e031ca875b1fedf13e8dcd571ba5101e91173c36bbb7c67dba9c900d03e7a3728d4b182cce18f43cc5f36fdc3738cad1e641566d977e025dcef25e12900d")
            } finally {
                await sim.close()
            }
        })


        test.skip.each(models)('round 1', async function (m) {
            const sim = new Zemu(m.path)
            try {
                await sim.start({ ...defaultOptions, model: m.name, startTimeout: 600000 })
                const app = new IronfishApp(sim.getTransport())

                const respIdentity = await app.dkgRound1(PATH, 1, [
                    "7232e78e0380a8104680ad7d2a9fc746464ee15ce5288ddef7d3fcd594fe400dfd4593b85e8307ad0b5a33ae3091985a74efda2e5b583f667f806232588ab7824cd7d2e031ca875b1fedf13e8dcd571ba5101e91173c36bbb7c67dba9c900d03e7a3728d4b182cce18f43cc5f36fdc3738cad1e641566d977e025dcef25e12900d",
                    "72510338227d8ee51fa11e048b56ae479a655c5510b906b90d029112a11566bac776c69d4bcd6471ce832100f6dd9a4024bd9580b5cfea11b2c8cdb2be16a46a2117f1d22a47c4ab0804c21ce4d7b33b4527c861edf4fd588fff6d9e31ca08ebdd8abd4bf237e158c43df6f998b6f1421fd59b390522b2ecd3ae0d40c18e5fa304"
                ], 2);

                console.log("publicPackage " + respIdentity.publicPackage?.toString("hex"))
                console.log("secretPackage " + respIdentity.secretPackage?.toString("hex"))

                expect(respIdentity.returnCode).toEqual(0x9000)
                expect(respIdentity.errorMessage).toEqual('No errors')

                // Cannot compare as the values change every time the round 1 is run (random values are used)
                //expect(respIdentity.publicPackage?.toString('hex')).toEqual("7232e78e0380a8104680ad7d2a9fc746464ee15ce5288ddef7d3fcd594fe400dfd4593b85e8307ad0b5a33ae3091985a74efda2e5b583f667f806232588ab7824cd7d2e031ca875b1fedf13e8dcd571ba5101e91173c36bbb7c67dba9c900d03e7a3728d4b182cce18f43cc5f36fdc3738cad1e641566d977e025dcef25e12900d8700000000c3d2051e0273b025b9bb106ebe13d51500bebe3e715b918b1880ff8a89a46a9b8a354d9847590713c3fc23a868edf2826374d257e115f4f9223858d09246e7b7b3d8c66b0340562ae698c2b2bf7398ec31f75cec4d6dc705f4ffd030a9764faf50cd88062453c643146747585e0d1ce515671553803e09542344e5399f086844c145809fc003980000009a8c5823efca6f6161dd71d13ced855f0bdfadc23ea6ce0a64cb7c0f0e66eb1ba53731564653e1f6642c1432a49db57102000000200000009fe7e7d6c63e050a26ac9c12f98bc57d6c933d5054951e15861d938f9bb18860ba8cb8c141e981ddb62913d688c4ee8084eb20065dc97e360c7369e1db4f5143f07dca965316b0b86c11ca7c4b205fd7a4eeb80e04c04898a170c01c88cb76d583492b614ddbd6c3")
                //expect(respIdentity.secretPackage?.toString('hex')).toEqual("d03dfa716a9d4a9a911436f1cc587e8c2e1d54a39f6fa4528c3b62c410211c3761cb61734a660cd57185c8633bc8892a01000000ac000000dca6e6a99d71139df9eefad3f9d0fa713b0a9590ce44bb191b51ec08d158f040d11bd2fd763ec36d11da0f84cd03daec9965099a95f93c6850206d7ee68e3471548ba698055365a0d0f1bb610e6e9481b11be1a8112ac8f73b39d1276d90c0cb2941101a74bcb2a48afc3028b65b5f51c6c0323fc21d779eefecac921ac9e6e578dd1d22d3a3fb369f6cacfaf5e93483fd6ad7b0177e87ed526a68c4b987822019e5cb380918004d24eafdc0866a453cc32ae03e1a9efd46699af39b1253e94ab2d5f3af176e6b48bc59267b")
            } finally {
                await sim.close()
            }
        })

        test.skip.each(models)('round 2', async function (m) {
            const sim = new Zemu(m.path)
            try {
                await sim.start({ ...defaultOptions, model: m.name, startTimeout: 600000 })
                const app = new IronfishApp(sim.getTransport())

                const respIdentity = await app.dkgRound2(
                    PATH,
                    1,
                    [
                        "7232e78e0380a8104680ad7d2a9fc746464ee15ce5288ddef7d3fcd594fe400dfd4593b85e8307ad0b5a33ae3091985a74efda2e5b583f667f806232588ab7824cd7d2e031ca875b1fedf13e8dcd571ba5101e91173c36bbb7c67dba9c900d03e7a3728d4b182cce18f43cc5f36fdc3738cad1e641566d977e025dcef25e12900d8700000000c3d2051e0273b025b9bb106ebe13d51500bebe3e715b918b1880ff8a89a46a9b8a354d9847590713c3fc23a868edf2826374d257e115f4f9223858d09246e7b7b3d8c66b0340562ae698c2b2bf7398ec31f75cec4d6dc705f4ffd030a9764faf50cd88062453c643146747585e0d1ce515671553803e09542344e5399f086844c145809fc003980000009a8c5823efca6f6161dd71d13ced855f0bdfadc23ea6ce0a64cb7c0f0e66eb1ba53731564653e1f6642c1432a49db57102000000200000009fe7e7d6c63e050a26ac9c12f98bc57d6c933d5054951e15861d938f9bb18860ba8cb8c141e981ddb62913d688c4ee8084eb20065dc97e360c7369e1db4f5143f07dca965316b0b86c11ca7c4b205fd7a4eeb80e04c04898a170c01c88cb76d583492b614ddbd6c3",
                        "72510338227d8ee51fa11e048b56ae479a655c5510b906b90d029112a11566bac776c69d4bcd6471ce832100f6dd9a4024bd9580b5cfea11b2c8cdb2be16a46a2117f1d22a47c4ab0804c21ce4d7b33b4527c861edf4fd588fff6d9e31ca08ebdd8abd4bf237e158c43df6f998b6f1421fd59b390522b2ecd3ae0d40c18e5fa3048700000000c3d2051e022a2f0d7393d18c1a4ce1ad488609048d32c789615f35f7dd0712fe52a3da8c3be605bb1c4420324ba58a8f0a805e157c5748385d7774a0b238270386d58c3e9c4010c8675c50a0a5f1614474490b3f6da2d3847f4af4f80b4f8426cd2854926fa13557b349806bb3d68c04ac871765182373c208e52efb382f4e3f88552d5f8f04980000001dd493472808f4f10c5b3f2a4d5258083ddaebcf78e2e35a71dcb360575d2711f6a7d7e0c90a6c61500460d7b1a03c0c0200000020000000bbd8f89dad7d0268af0409a4cb77e14a5f1ab116af96bbaa5d9163ff2e907a49a8cbb2dfd9fef57403f53a991e517109fe4710c538ec75cf63915c9e0f699183b148e64d869b2fbe17781f95f69edcacf947ce0b04a8ce0f38b4e8e2a06b366983492b614ddbd6c3"
                    ],
                    "d03dfa716a9d4a9a911436f1cc587e8c2e1d54a39f6fa4528c3b62c410211c3761cb61734a660cd57185c8633bc8892a01000000ac000000dca6e6a99d71139df9eefad3f9d0fa713b0a9590ce44bb191b51ec08d158f040d11bd2fd763ec36d11da0f84cd03daec9965099a95f93c6850206d7ee68e3471548ba698055365a0d0f1bb610e6e9481b11be1a8112ac8f73b39d1276d90c0cb2941101a74bcb2a48afc3028b65b5f51c6c0323fc21d779eefecac921ac9e6e578dd1d22d3a3fb369f6cacfaf5e93483fd6ad7b0177e87ed526a68c4b987822019e5cb380918004d24eafdc0866a453cc32ae03e1a9efd46699af39b1253e94ab2d5f3af176e6b48bc59267b"
                );

                console.log(respIdentity.identity?.toString("hex"))

                expect(respIdentity.returnCode).toEqual(0x9000)
                expect(respIdentity.errorMessage).toEqual('No errors')
                expect(respIdentity.identity?.toString('hex')).toEqual("0104a42cd833e21478268f44bf933f13359a0936e477be88fb9f46b7876f81046548d3d0c9d0f27b08e5f43e710c330bc35601000000ac0000004acbe50f5c3a245d6539611a54d8d5a5ddfd8ee1124341c5e8226b7f8b7604fc39da3dec18e569a077033ed5ce16c6c9264b253d3fd82ee3199dce54c020a729fe61454400cf85438b93d7b81483e74887d6ca9adb699faf435135b6cb3b05ac5724cc8758eb701de3ec58eec276950824f6ef20ee52bcf55b42dd4a9358fe0a685c595259bbd21f00ef6e632d86c08e99d96b1d45bfaa1cea5301bc766229fdee093383b791ec7b6d8499cf68d0f6fa30a7d09583475bcbcf81936b27e1386b7e65485911020000bff4c17a01b072510338227d8ee51fa11e048b56ae479a655c5510b906b90d029112a11566bac776c69d4bcd6471ce832100f6dd9a4024bd9580b5cfea11b2c8cdb2be16a46a2117f1d22a47c4ab0804c21ce4d7b33b4527c861edf4fd588fff6d9e31ca08ebdd8abd4bf237e158c43df6f998b6f1421fd59b390522b2ecd3ae0d40c18e5fa3048700000000c3d2051e0256298dd7a68d125d01d70f2b19e9d6a3288157788943d34740730232ffd910e12c330a83b4eba848e78b8d991d4b3903e8443b45be20433b22351974c76b2ba7402f28331350958c27ea178fbad9474a6709ecb6b31e569e9c826e581e64cb343d0f28d560883e00897181305045227339875d9af4d4f7193205815076162ab90b980000009692e0f0e35c9755af10430df138d86ad30763b22769f71d50af19209acecc56b3c8e280ace88f57a7961b12072fba9e0200000020000000f0376ab96314acb6b5dcdc236f9cbfea09ef4fae196479ecf8c2a416fa14509b915d530804997274bd4e866c743e4872f57f5ed02dbaaa712d7c3505b93f533ff91f56fb4b7b741ddee6ef4ccafde4858e748336539f64554f804c9675498025749453ce1be5b689")
            } finally {
                await sim.close()
            }
        })
    })

})
