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

    describe.skip("participant 1", () => {
        test.each(models)('get identity', async function (m) {
            const sim = new Zemu(m.path)
            try {
                await sim.start({ ...defaultOptions, model: m.name })
                const app = new IronfishApp(sim.getTransport())
                const respIdentity = await app.dkgGetIdentity()

                console.log(respIdentity)
                console.log(respIdentity.identity?.toString('hex'))

                expect(respIdentity.returnCode).toEqual(0x9000)
                expect(respIdentity.errorMessage).toEqual('No errors')
                expect(respIdentity.identity?.toString('hex')).toEqual("72510338227d8ee51fa11e048b56ae479a655c5510b906b90d029112a11566bac776c69d4bcd6471ce832100f6dd9a4024bd9580b5cfea11b2c8cdb2be16a46a2117f1d22a47c4ab0804c21ce4d7b33b4527c861edf4fd588fff6d9e31ca08ebdd8abd4bf237e158c43df6f998b6f1421fd59b390522b2ecd3ae0d40c18e5fa304")
            } finally {
                await sim.close()
            }
        })

        test.each(models)('round 1', async function (m) {
            const sim = new Zemu(m.path)
            try {
                await sim.start({ ...defaultOptions, model: m.name, startTimeout: 600000 })
                const app = new IronfishApp(sim.getTransport())

                const respIdentity = await app.dkgRound1(PATH, [
                    "72510338227d8ee51fa11e048b56ae479a655c5510b906b90d029112a11566bac776c69d4bcd6471ce832100f6dd9a4024bd9580b5cfea11b2c8cdb2be16a46a2117f1d22a47c4ab0804c21ce4d7b33b4527c861edf4fd588fff6d9e31ca08ebdd8abd4bf237e158c43df6f998b6f1421fd59b390522b2ecd3ae0d40c18e5fa304",
                    "7232e78e0380a8104680ad7d2a9fc746464ee15ce5288ddef7d3fcd594fe400dfd4593b85e8307ad0b5a33ae3091985a74efda2e5b583f667f806232588ab7824cd7d2e031ca875b1fedf13e8dcd571ba5101e91173c36bbb7c67dba9c900d03e7a3728d4b182cce18f43cc5f36fdc3738cad1e641566d977e025dcef25e12900d"
                ], 2);

                console.log("publicPackage " + respIdentity.publicPackage?.toString("hex"))
                console.log("secretPackage " + respIdentity.secretPackage?.toString("hex"))

                expect(respIdentity.returnCode).toEqual(0x9000)
                expect(respIdentity.errorMessage).toEqual('No errors')

                // Cannot compare as the values change every time the round 1 is run (random values are used)
                //expect(respIdentity.publicPackage?.toString('hex')).toEqual("72510338227d8ee51fa11e048b56ae479a655c5510b906b90d029112a11566bac776c69d4bcd6471ce832100f6dd9a4024bd9580b5cfea11b2c8cdb2be16a46a2117f1d22a47c4ab0804c21ce4d7b33b4527c861edf4fd588fff6d9e31ca08ebdd8abd4bf237e158c43df6f998b6f1421fd59b390522b2ecd3ae0d40c18e5fa3048700000000c3d2051e024598399dd2c5079dd3c03c180057d6250c37d9812f4444151e466c3a1118b2e32e44e508de723c816ecc19b16492f8f7ba57ae0741a908083dfb827fb12d16224054679db70c9189607a4135faa8ab7701ccfe5c6759baad41ed2e23d12760f94610e2e37e390dcf8c9776fb1f1b815081ec9c80fd76564fe0213d8a73fd7ab7069800000072f78e05772b6009d195801b5076f1e1f009d0fa8078613249e63480f3032442683526482dc10acc00f73644ac92c49102000000200000009ddcb6b697dc8abad84dfeab4bc0fb19f72274026aa8babc91681913dd91111dd42dc65d4cb09d72ac6c06805a62e5ec84a2de87a16ae169498adbe6c921975212d2ac2844344d8e864272349b4c99e3b2f66c12f3adfbcc9b5ed09d7885a1dd83492b614ddbd6c3")
                //expect(respIdentity.secretPackage?.toString('hex')).toEqual("b47f2f954b881e0d54a14e123a44622c9bb99dd2edf1b93cf2d8b3387bd4b60f122238354250ad02b9192a953087e4b201000000ac00000035f3e5dd3070e9d3101363300cb755762bce9c8c7c930c56f1b80c177e057f71ad1e7d88908934882d55ea396abf2c83096719ecdb895a012a39fbd50bc5455ad56b025cae63e093cfff6369f650b868902a78b3c22c07222937499eb1d54eb2ea762c75f62eb1ee7926de24562d980a49b16c5a0e33aef7599537212e192bc38ae60a9cd37bcf69f9f0e4aafcd945ec54f0b1e2ada512baa7673e32d7417516c4489180ceae03424f8c2423ebc30d6b781ae8e08fbb75ceb86b6fd536cacd9877481c6600d4ef60b8012f76")
            } finally {
                await sim.close()
            }
        })


        test.each(models)('round 2', async function (m) {
            const sim = new Zemu(m.path)
            try {
                await sim.start({ ...defaultOptions, model: m.name, startTimeout: 600000 })
                const app = new IronfishApp(sim.getTransport())

                const respIdentity = await app.dkgRound2(
                    PATH,
                    [
                        "72510338227d8ee51fa11e048b56ae479a655c5510b906b90d029112a11566bac776c69d4bcd6471ce832100f6dd9a4024bd9580b5cfea11b2c8cdb2be16a46a2117f1d22a47c4ab0804c21ce4d7b33b4527c861edf4fd588fff6d9e31ca08ebdd8abd4bf237e158c43df6f998b6f1421fd59b390522b2ecd3ae0d40c18e5fa3048700000000c3d2051e024598399dd2c5079dd3c03c180057d6250c37d9812f4444151e466c3a1118b2e32e44e508de723c816ecc19b16492f8f7ba57ae0741a908083dfb827fb12d16224054679db70c9189607a4135faa8ab7701ccfe5c6759baad41ed2e23d12760f94610e2e37e390dcf8c9776fb1f1b815081ec9c80fd76564fe0213d8a73fd7ab7069800000072f78e05772b6009d195801b5076f1e1f009d0fa8078613249e63480f3032442683526482dc10acc00f73644ac92c49102000000200000009ddcb6b697dc8abad84dfeab4bc0fb19f72274026aa8babc91681913dd91111dd42dc65d4cb09d72ac6c06805a62e5ec84a2de87a16ae169498adbe6c921975212d2ac2844344d8e864272349b4c99e3b2f66c12f3adfbcc9b5ed09d7885a1dd83492b614ddbd6c3",
                        "7232e78e0380a8104680ad7d2a9fc746464ee15ce5288ddef7d3fcd594fe400dfd4593b85e8307ad0b5a33ae3091985a74efda2e5b583f667f806232588ab7824cd7d2e031ca875b1fedf13e8dcd571ba5101e91173c36bbb7c67dba9c900d03e7a3728d4b182cce18f43cc5f36fdc3738cad1e641566d977e025dcef25e12900d8700000000c3d2051e026fe77377936550f0e3e6b93ed77c55c7d7f77464562de0e89eebac7172ea164ff374d479bc194399cf1bf3c3f0c662da7ba1a5b991b60fd36e3ce718cc55e965406a7af59480b444fb362f62bda8b49d5965a3bc91a1abdbcb2fd695a8bb9bf235cbfb1c21280be4b403782e3b658f1ae135e29fdcdf3ddc607524cf6cf65e5e0198000000e7f14fb83f09675842075ee6e7fbb49ee8f965c3c98a0b89b60eee4dfc5bac423930bf4907c2c94ea9483084d4f401c40200000020000000d164aa8faae98be40f9b0b2cef6736287f4de986639818ab3f856f9d7c4ffaa45ca6587bd007660145d5e0936eb35c46013ff7b3d6a358e4c4a47142571a1fa24087d862f84948d25ae2a6425df4124e746457a2426c21dbf97904a4977447b783492b614ddbd6c3",
                    ],
                    "b47f2f954b881e0d54a14e123a44622c9bb99dd2edf1b93cf2d8b3387bd4b60f122238354250ad02b9192a953087e4b201000000ac00000035f3e5dd3070e9d3101363300cb755762bce9c8c7c930c56f1b80c177e057f71ad1e7d88908934882d55ea396abf2c83096719ecdb895a012a39fbd50bc5455ad56b025cae63e093cfff6369f650b868902a78b3c22c07222937499eb1d54eb2ea762c75f62eb1ee7926de24562d980a49b16c5a0e33aef7599537212e192bc38ae60a9cd37bcf69f9f0e4aafcd945ec54f0b1e2ada512baa7673e32d7417516c4489180ceae03424f8c2423ebc30d6b781ae8e08fbb75ceb86b6fd536cacd9877481c6600d4ef60b8012f76"
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

    describe("participant 2", () => {
        test.each(models)('get identity', async function (m) {
            const sim = new Zemu(m.path)
            try {
                await sim.start({ ...defaultOptions, model: m.name })
                const app = new IronfishApp(sim.getTransport())
                const respIdentity = await app.dkgGetIdentity()

                console.log(respIdentity)
                console.log(respIdentity.identity?.toString('hex'))

                expect(respIdentity.returnCode).toEqual(0x9000)
                expect(respIdentity.errorMessage).toEqual('No errors')
                expect(respIdentity.identity?.toString('hex')).toEqual("7232e78e0380a8104680ad7d2a9fc746464ee15ce5288ddef7d3fcd594fe400dfd4593b85e8307ad0b5a33ae3091985a74efda2e5b583f667f806232588ab7824cd7d2e031ca875b1fedf13e8dcd571ba5101e91173c36bbb7c67dba9c900d03e7a3728d4b182cce18f43cc5f36fdc3738cad1e641566d977e025dcef25e12900d")
            } finally {
                await sim.close()
            }
        })


        test.each(models)('round 1', async function (m) {
            const sim = new Zemu(m.path)
            try {
                await sim.start({ ...defaultOptions, model: m.name, startTimeout: 600000 })
                const app = new IronfishApp(sim.getTransport())

                const respIdentity = await app.dkgRound1(PATH, [
                    "7232e78e0380a8104680ad7d2a9fc746464ee15ce5288ddef7d3fcd594fe400dfd4593b85e8307ad0b5a33ae3091985a74efda2e5b583f667f806232588ab7824cd7d2e031ca875b1fedf13e8dcd571ba5101e91173c36bbb7c67dba9c900d03e7a3728d4b182cce18f43cc5f36fdc3738cad1e641566d977e025dcef25e12900d",
                    "72510338227d8ee51fa11e048b56ae479a655c5510b906b90d029112a11566bac776c69d4bcd6471ce832100f6dd9a4024bd9580b5cfea11b2c8cdb2be16a46a2117f1d22a47c4ab0804c21ce4d7b33b4527c861edf4fd588fff6d9e31ca08ebdd8abd4bf237e158c43df6f998b6f1421fd59b390522b2ecd3ae0d40c18e5fa304"
                ], 2);

                console.log("publicPackage " + respIdentity.publicPackage?.toString("hex"))
                console.log("secretPackage " + respIdentity.secretPackage?.toString("hex"))

                expect(respIdentity.returnCode).toEqual(0x9000)
                expect(respIdentity.errorMessage).toEqual('No errors')

                // Cannot compare as the values change every time the round 1 is run (random values are used)
                //expect(respIdentity.publicPackage?.toString('hex')).toEqual("7232e78e0380a8104680ad7d2a9fc746464ee15ce5288ddef7d3fcd594fe400dfd4593b85e8307ad0b5a33ae3091985a74efda2e5b583f667f806232588ab7824cd7d2e031ca875b1fedf13e8dcd571ba5101e91173c36bbb7c67dba9c900d03e7a3728d4b182cce18f43cc5f36fdc3738cad1e641566d977e025dcef25e12900d8700000000c3d2051e026fe77377936550f0e3e6b93ed77c55c7d7f77464562de0e89eebac7172ea164ff374d479bc194399cf1bf3c3f0c662da7ba1a5b991b60fd36e3ce718cc55e965406a7af59480b444fb362f62bda8b49d5965a3bc91a1abdbcb2fd695a8bb9bf235cbfb1c21280be4b403782e3b658f1ae135e29fdcdf3ddc607524cf6cf65e5e0198000000e7f14fb83f09675842075ee6e7fbb49ee8f965c3c98a0b89b60eee4dfc5bac423930bf4907c2c94ea9483084d4f401c40200000020000000d164aa8faae98be40f9b0b2cef6736287f4de986639818ab3f856f9d7c4ffaa45ca6587bd007660145d5e0936eb35c46013ff7b3d6a358e4c4a47142571a1fa24087d862f84948d25ae2a6425df4124e746457a2426c21dbf97904a4977447b783492b614ddbd6c3")
                //expect(respIdentity.secretPackage?.toString('hex')).toEqual("67ee4640ba4e28251cece3adf4cbc40a5e76b3dbbd644cab376a28411fc179216fd3684a065018d29b5a8e0d41e4e4e101000000ac000000c9f809c3803e7034e7c8ec6d994dd708dd769f325ee2ef3abf8754f39891e89600b204ad87128b1319aeaf6f49b166f64517199d46b249b2b3368bffd8d20ceca1c08573ee20db0fd6f2ef5476860b730803ab4a8f2872a0f277516e7fdf7a6ab4440c91676444e089bd0724b5876a7a77338532cc6ebc22f7ac7512aeda08cfc36f6b685263054daa6315effcc7ce616d70f47bf1fee74d7dde0ebec9ee623664ad8b1e4722ae67449562501bc23a902e8e54ab11b857281b2f304119e7a994e617e64c41a289b1ccded511")
            } finally {
                await sim.close()
            }
        })

        test.each(models)('round 2', async function (m) {
            const sim = new Zemu(m.path)
            try {
                await sim.start({ ...defaultOptions, model: m.name, startTimeout: 600000 })
                const app = new IronfishApp(sim.getTransport())

                const respIdentity = await app.dkgRound2(
                    PATH,
                    [
                        "72510338227d8ee51fa11e048b56ae479a655c5510b906b90d029112a11566bac776c69d4bcd6471ce832100f6dd9a4024bd9580b5cfea11b2c8cdb2be16a46a2117f1d22a47c4ab0804c21ce4d7b33b4527c861edf4fd588fff6d9e31ca08ebdd8abd4bf237e158c43df6f998b6f1421fd59b390522b2ecd3ae0d40c18e5fa3048700000000c3d2051e024598399dd2c5079dd3c03c180057d6250c37d9812f4444151e466c3a1118b2e32e44e508de723c816ecc19b16492f8f7ba57ae0741a908083dfb827fb12d16224054679db70c9189607a4135faa8ab7701ccfe5c6759baad41ed2e23d12760f94610e2e37e390dcf8c9776fb1f1b815081ec9c80fd76564fe0213d8a73fd7ab7069800000072f78e05772b6009d195801b5076f1e1f009d0fa8078613249e63480f3032442683526482dc10acc00f73644ac92c49102000000200000009ddcb6b697dc8abad84dfeab4bc0fb19f72274026aa8babc91681913dd91111dd42dc65d4cb09d72ac6c06805a62e5ec84a2de87a16ae169498adbe6c921975212d2ac2844344d8e864272349b4c99e3b2f66c12f3adfbcc9b5ed09d7885a1dd83492b614ddbd6c3",
                        "7232e78e0380a8104680ad7d2a9fc746464ee15ce5288ddef7d3fcd594fe400dfd4593b85e8307ad0b5a33ae3091985a74efda2e5b583f667f806232588ab7824cd7d2e031ca875b1fedf13e8dcd571ba5101e91173c36bbb7c67dba9c900d03e7a3728d4b182cce18f43cc5f36fdc3738cad1e641566d977e025dcef25e12900d8700000000c3d2051e026fe77377936550f0e3e6b93ed77c55c7d7f77464562de0e89eebac7172ea164ff374d479bc194399cf1bf3c3f0c662da7ba1a5b991b60fd36e3ce718cc55e965406a7af59480b444fb362f62bda8b49d5965a3bc91a1abdbcb2fd695a8bb9bf235cbfb1c21280be4b403782e3b658f1ae135e29fdcdf3ddc607524cf6cf65e5e0198000000e7f14fb83f09675842075ee6e7fbb49ee8f965c3c98a0b89b60eee4dfc5bac423930bf4907c2c94ea9483084d4f401c40200000020000000d164aa8faae98be40f9b0b2cef6736287f4de986639818ab3f856f9d7c4ffaa45ca6587bd007660145d5e0936eb35c46013ff7b3d6a358e4c4a47142571a1fa24087d862f84948d25ae2a6425df4124e746457a2426c21dbf97904a4977447b783492b614ddbd6c3"
                    ],
                    "67ee4640ba4e28251cece3adf4cbc40a5e76b3dbbd644cab376a28411fc179216fd3684a065018d29b5a8e0d41e4e4e101000000ac000000c9f809c3803e7034e7c8ec6d994dd708dd769f325ee2ef3abf8754f39891e89600b204ad87128b1319aeaf6f49b166f64517199d46b249b2b3368bffd8d20ceca1c08573ee20db0fd6f2ef5476860b730803ab4a8f2872a0f277516e7fdf7a6ab4440c91676444e089bd0724b5876a7a77338532cc6ebc22f7ac7512aeda08cfc36f6b685263054daa6315effcc7ce616d70f47bf1fee74d7dde0ebec9ee623664ad8b1e4722ae67449562501bc23a902e8e54ab11b857281b2f304119e7a994e617e64c41a289b1ccded511"
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
