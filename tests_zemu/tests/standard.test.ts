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

import Zemu, { ButtonKind, zondaxMainmenuNavigation } from '@zondax/zemu'
import { PATH, defaultOptions, expectedKeys, models, spend_1_output_1, spend_1_output_4_mint_1_burn_1, spend_2_output_6_mint_2_burn_1 } from './common'
import IronfishApp, { IronfishKeys, ResponseAddress, ResponseProofGenKey, ResponseViewKey } from '@zondax/ledger-ironfish'

jest.setTimeout(45000)

describe.skip('Standard', function () {
  test.concurrent.each(models)('can start and stop container', async function (m) {
    const sim = new Zemu(m.path)
    try {
      await sim.start({ ...defaultOptions, model: m.name })
    } finally {
      await sim.close()
    }
  })

  test.concurrent.each(models)('main menu', async function (m) {
    const sim = new Zemu(m.path)
    try {
      await sim.start({ ...defaultOptions, model: m.name })
      const nav = zondaxMainmenuNavigation(m.name, [1, 0, 0, 4, -5])
      await sim.navigateAndCompareSnapshots('.', `${m.prefix.toLowerCase()}-mainmenu`, nav.schedule)
    } finally {
      await sim.close()
    }
  })

  test.concurrent.each(models)('get app version', async function (m) {
    const sim = new Zemu(m.path)
    try {
      await sim.start({ ...defaultOptions, model: m.name })
      const app = new IronfishApp(sim.getTransport())
      const resp = await app.getVersion()

      console.log(resp)

      expect(resp.returnCode).toEqual(0x9000)
      expect(resp.errorMessage).toEqual('No errors')
      expect(resp).toHaveProperty('testMode')
      expect(resp).toHaveProperty('major')
      expect(resp).toHaveProperty('minor')
      expect(resp).toHaveProperty('patch')
    } finally {
      await sim.close()
    }
  })

  test.concurrent.each(models)('get address', async function (m) {
    const sim = new Zemu(m.path)
    try {
      await sim.start({ ...defaultOptions, model: m.name })
      const app = new IronfishApp(sim.getTransport())

      const resp: ResponseAddress = await app.retrieveKeys(PATH, IronfishKeys.PublicAddress, false)
      console.log(resp)

      expect(resp.returnCode).toEqual(0x9000)
      expect(resp.errorMessage).toEqual('No errors')
      expect(resp.publicAddress?.toString('hex')).toEqual(expectedKeys.publicAddress)
    } finally {
      await sim.close()
    }
  })

  test.concurrent.each(models)('show address', async function (m) {
    const sim = new Zemu(m.path)
    try {
      await sim.start({
        ...defaultOptions,
        model: m.name,
        approveKeyword: m.name === 'stax' ? 'Path' : '',
        approveAction: ButtonKind.ApproveTapButton,
      })
      const app = new IronfishApp(sim.getTransport())

      const respRequest = app.retrieveKeys(PATH, IronfishKeys.PublicAddress, true)
      // Wait until we are not in the main menu
      await sim.waitUntilScreenIsNot(sim.getMainMenuSnapshot())
      await sim.compareSnapshotsAndApprove('.', `${m.prefix.toLowerCase()}-show_address`)

      const resp: ResponseAddress = await respRequest
      console.log(resp)

      expect(resp.returnCode).toEqual(0x9000)
      expect(resp.errorMessage).toEqual('No errors')
    } finally {
      await sim.close()
    }
  })

  test.concurrent.each(models)('show address - reject', async function (m) {
    const sim = new Zemu(m.path)
    try {
      await sim.start({ ...defaultOptions, model: m.name, rejectKeyword: m.name === 'stax' ? 'QR' : '' })
      const app = new IronfishApp(sim.getTransport())

      const respRequest = app.retrieveKeys(PATH, IronfishKeys.PublicAddress, true)
      // Wait until we are not in the main menu
      await sim.waitUntilScreenIsNot(sim.getMainMenuSnapshot())
      await sim.compareSnapshotsAndReject('.', `${m.prefix.toLowerCase()}-show_address_reject`)

      const resp: ResponseAddress = await respRequest
      console.log(resp)

      expect(resp.returnCode).toEqual(0x6986)
      expect(resp.errorMessage).toEqual('Transaction rejected')
    } finally {
      await sim.close()
    }
  })

  test.concurrent.each(models)('get proof generation key', async function (m) {
    const sim = new Zemu(m.path)
    try {
      await sim.start({ ...defaultOptions, model: m.name })
      const app = new IronfishApp(sim.getTransport())

      const resp: ResponseProofGenKey = await app.retrieveKeys(PATH, IronfishKeys.ProofGenerationKey, false)
      console.log(resp)

      expect(resp.returnCode).toEqual(0x9000)
      expect(resp.errorMessage).toEqual('No errors')
      expect(resp.ak?.toString('hex')).toEqual(expectedKeys.ak)
      expect(resp.nsk?.toString('hex')).toEqual(expectedKeys.nsk)
    } finally {
      await sim.close()
    }
  })

  test.concurrent.each(models)('show view key', async function (m) {
    const sim = new Zemu(m.path)
    try {
      await sim.start({ ...defaultOptions, model: m.name })
      const app = new IronfishApp(sim.getTransport())

      const respRequest = app.retrieveKeys(PATH, IronfishKeys.ViewKey, true)
      // Wait until we are not in the main menu
      await sim.waitUntilScreenIsNot(sim.getMainMenuSnapshot())
      await sim.compareSnapshotsAndApprove('.', `${m.prefix.toLowerCase()}-show_viewkey`)

      const resp: ResponseViewKey = await respRequest
      console.log(resp)

      expect(resp.returnCode).toEqual(0x9000)
      expect(resp.errorMessage).toEqual('No errors')
      expect(resp.viewKey?.toString('hex')).toEqual(expectedKeys.viewKey)
      expect(resp.ivk?.toString('hex')).toEqual(expectedKeys.ivk)
      expect(resp.ovk?.toString('hex')).toEqual(expectedKeys.ovk)
    } finally {
      await sim.close()
    }
  })

  test.concurrent.each(models)('blind-signing', async function (m) {
    const sim = new Zemu(m.path)
    try {
      await sim.start({ ...defaultOptions, model: m.name })
      const app = new IronfishApp(sim.getTransport())

      const txBlob = Buffer.from(spend_1_output_1, 'hex')
      const responsePublicAddress = await app.retrieveKeys(PATH, IronfishKeys.PublicAddress, false)
      console.log(responsePublicAddress)

      // do not wait here.. we need to navigate
      const signatureRequest = app.sign(PATH, txBlob)

      // Wait until we are not in the main menu
      await sim.waitUntilScreenIsNot(sim.getMainMenuSnapshot())
      await sim.compareSnapshotsAndApprove('.', `${m.prefix.toLowerCase()}-blind_sign`)

      const signatureResponse = await signatureRequest
      console.log(signatureResponse)

      console.log(signatureResponse.signature?.length)

      expect(signatureResponse.returnCode).toEqual(0x9000)
      expect(signatureResponse.errorMessage).toEqual('No errors')
    } finally {
      await sim.close()
    }
  })

  test.concurrent.each(models)('blind-signing2', async function (m) {
    const sim = new Zemu(m.path)
    try {
      await sim.start({ ...defaultOptions, model: m.name })
      const app = new IronfishApp(sim.getTransport())

      const txBlob = Buffer.from(spend_1_output_4_mint_1_burn_1, 'hex')
      const responsePublicAddress = await app.retrieveKeys(PATH, IronfishKeys.PublicAddress, false)
      console.log(responsePublicAddress)

      // do not wait here.. we need to navigate
      const signatureRequest = app.sign(PATH, txBlob)

      // Wait until we are not in the main menu
      await sim.waitUntilScreenIsNot(sim.getMainMenuSnapshot())
      await sim.compareSnapshotsAndApprove('.', `${m.prefix.toLowerCase()}-blind_sign2`)

      const signatureResponse = await signatureRequest
      console.log(signatureResponse)

      console.log(signatureResponse.signature?.length)

      expect(signatureResponse.returnCode).toEqual(0x9000)
      expect(signatureResponse.errorMessage).toEqual('No errors')
    } finally {
      await sim.close()
    }
  })

  test.concurrent.each(models)('blind-signing3', async function (m) {
    const sim = new Zemu(m.path)
    try {
      await sim.start({ ...defaultOptions, model: m.name })
      const app = new IronfishApp(sim.getTransport())

      const txBlob = Buffer.from(spend_2_output_6_mint_2_burn_1, 'hex')
      const responsePublicAddress = await app.retrieveKeys(PATH, IronfishKeys.PublicAddress, false)
      console.log(responsePublicAddress)

      // do not wait here.. we need to navigate
      const signatureRequest = app.sign(PATH, txBlob)

      // Wait until we are not in the main menu
      await sim.waitUntilScreenIsNot(sim.getMainMenuSnapshot())
      await sim.compareSnapshotsAndApprove('.', `${m.prefix.toLowerCase()}-blind_sign3`)

      const signatureResponse = await signatureRequest
      console.log(signatureResponse)

      console.log(signatureResponse.signature?.length)

      expect(signatureResponse.returnCode).toEqual(0x9000)
      expect(signatureResponse.errorMessage).toEqual('No errors')
    } finally {
      await sim.close()
    }
  })
})
