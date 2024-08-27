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
    test.concurrent.each(models)('can start and stop container', async function (m) {
        const sim = new Zemu(m.path)
        try {
            await sim.start({ ...defaultOptions, model: m.name  })
        } finally {
            await sim.close()
        }
    })


    test.concurrent.each(models)('get identity', async function (m) {
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


    test.skip.each(models)('round 1', async function (m) {
        const sim = new Zemu(m.path)
        try {
            await sim.start({ ...defaultOptions, model: m.name, startTimeout: 600000 })
            const app = new IronfishApp(sim.getTransport())

            const respIdentity = await app.dkgRound1(PATH, [
                "722f8ce1ff2e73f83604eab390826c2ca63ae37fdf5e9b5d1b8e99bc5351892e23ce2f6e90ca158d8a3929358225936ed749bca009fb5b94c9ed0b44f9b7202b11239a85ab24eee287b1158a51b533c2db2e5e90e9c43480be536bb3fdc7f8f9c5b485c54cbd636b057c5009515b409b5fd7e460b0b04efa3650a6e8298ae91406",
                "72b77943a1af7d0b6dcf0f281d7eb57dcc0540930da6f3c330c1dcf71789dfea2113149ef55e69fc6cb6855435821fe83031c253e26b2499f6d6989984230c962db98971be7aae233c302a3a44cfd17d957e9666f58e31c073b76ee2f4b72cb72f92fce80df70956c591d72013cf3a578587a6e403361138cf7e5960fab304f501"
            ], 2);

            console.log(respIdentity.identity?.toString("hex"))
            //console.log(respIdentity.identity?.toString('hex'))

            expect(respIdentity.returnCode).toEqual(0x9000)
            expect(respIdentity.errorMessage).toEqual('No errors')
            //expect(respIdentity.identity?.toString('hex')).toEqual("72510338227d8ee51fa11e048b56ae479a655c5510b906b90d029112a11566bac776c69d4bcd6471ce832100f6dd9a4024bd9580b5cfea11b2c8cdb2be16a46a2117f1d22a47c4ab0804c21ce4d7b33b4527c861edf4fd588fff6d9e31ca08ebdd8abd4bf237e158c43df6f998b6f1421fd59b390522b2ecd3ae0d40c18e5fa304")
        } finally {
            await sim.close()
        }
    })

})
