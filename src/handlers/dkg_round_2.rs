/*****************************************************************************
 *   Ledger App Ironfish Rust.
 *   (c) 2023 Ledger SAS.
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
 *****************************************************************************/

use crate::{AppSW, Instruction};
use alloc::vec::Vec;
use ledger_device_sdk::random::LedgerRng;
use ironfish_frost::dkg;
use ironfish_frost::dkg::round1::PublicPackage;
use ironfish_frost::dkg::round2::CombinedPublicPackage;
use ironfish_frost::error::IronfishFrostError;
use ironfish_frost::participant::{Secret};
use ledger_device_sdk::io::{Comm, Event};
use crate::handlers::dkg_get_identity::compute_dkg_secret;
use crate::handlers::sign_tx::TxContext;

const MAX_TRANSACTION_LEN: usize = 2040;
const MAX_APDU_SIZE: usize = 253;

pub struct Tx {
    identity_index: u8,
    round_1_public_packages: Vec<PublicPackage>,
    round_1_secret_package: Vec<u8>,
}

pub fn handler_dkg_round_2(
    comm: &mut Comm,
    chunk: u8,
    ctx: &mut TxContext,
) -> Result<(), AppSW> {
    // Try to get data from comm
    let data = comm.get_data().map_err(|_| AppSW::WrongApduLength)?;

    // First chunk, try to parse the path
    if chunk == 0 {
        // Reset transaction context
        ctx.reset();
        // This will propagate the error if the path is invalid
        ctx.path = data.try_into()?;
        return Ok(());

    }

    // Next chunks, append data to raw_tx and return or parse
    // the transaction if it is the last chunk.
    if ctx.raw_tx.len() + data.len() > MAX_TRANSACTION_LEN {
        return Err(AppSW::TxWrongLength);
    }

    // Append data to raw_tx
    ctx.raw_tx.extend(data);

    // If we expect more chunks, return
    if chunk == 1 {
        ctx.review_finished = false;
        return Ok(());
    // Otherwise, try to parse the transaction
    }

    // Try to deserialize the transaction
    let tx: Tx = parse_tx(&ctx.raw_tx).map_err(|_| AppSW::TxParsingFail)?;
    // Reset transaction context as we want to release space on the heap
    ctx.reset();

    let dkg_secret = compute_dkg_secret(tx.identity_index);
    let (round2_secret_package_vec, round2_public_package) = compute_dkg_round_2(dkg_secret, tx).map_err(|_| AppSW::DkgRound2Fail)?;

    let response = generate_response(round2_secret_package_vec, round2_public_package);

    send_apdu_chunks(comm, &response)?;
    Ok(())
}

fn parse_tx(raw_tx: &Vec<u8>) -> Result<Tx, &str>{
    let mut tx_pos:usize = 0;

    let identity_index = raw_tx[tx_pos];
    tx_pos +=1;

    let elements = raw_tx[tx_pos];
    tx_pos +=1;

    let len = (((raw_tx[tx_pos] as u16) << 8) | (raw_tx[tx_pos+1] as u16)) as usize;
    tx_pos +=2;

    let mut round_1_public_packages : Vec<PublicPackage> = Vec::new();
    for _i in 0..elements {
        let public_package = PublicPackage::deserialize_from(&raw_tx[tx_pos..tx_pos+len]).unwrap();
        tx_pos += len;

        round_1_public_packages.push(public_package);
    }

    let len = (((raw_tx[tx_pos] as u16) << 8) | (raw_tx[tx_pos+1] as u16)) as usize;
    tx_pos +=2;

    let round_1_secret_package = raw_tx[tx_pos..tx_pos+len].to_vec();
    tx_pos += len;

    if tx_pos != raw_tx.len() {
        return Err("invalid payload");
    }

    Ok(Tx{round_1_secret_package, round_1_public_packages,identity_index})
}

fn compute_dkg_round_2(secret: Secret, tx: Tx) -> Result<(Vec<u8>, CombinedPublicPackage), IronfishFrostError> {
    let mut rng = LedgerRng{};

   dkg::round2::round2(
        &secret,
        &tx.round_1_secret_package,
        &tx.round_1_public_packages,
        &mut rng,
    )
}

fn generate_response(mut round2_secret_package_vec: Vec<u8>, round2_public_package: CombinedPublicPackage) -> Vec<u8> {
    let mut resp : Vec<u8> = Vec::new();
    let mut round2_public_package_vec = round2_public_package.serialize();
    let round2_public_package_len = round2_public_package_vec.len();
    let round2_secret_package_len = round2_secret_package_vec.len();

    resp.append(&mut [(round2_secret_package_len >> 8) as u8, (round2_secret_package_len & 0xFF) as u8].to_vec());
    resp.append(&mut round2_secret_package_vec);
    resp.append(&mut [(round2_public_package_len >> 8) as u8, (round2_public_package_len & 0xFF) as u8].to_vec());
    resp.append(&mut round2_public_package_vec);

    resp
}

fn send_apdu_chunks(comm: &mut Comm, data_vec: &Vec<u8>) -> Result<(), AppSW> {
    let data = data_vec.as_slice();
    let total_chunks = (data.len() + MAX_APDU_SIZE - 1) / MAX_APDU_SIZE;

    comm.append(&data[0..3]);
/*
    for (i, chunk) in data.chunks(MAX_APDU_SIZE).enumerate() {
        comm.append(chunk);

        if i < total_chunks - 1 {
            comm.reply_ok();
            match comm.next_event() {
                Event::Command(Instruction::DkgRound1 { chunk: 0 }) => {}
                _ => {},
            }
        }
    }*/

    Ok(())
}
