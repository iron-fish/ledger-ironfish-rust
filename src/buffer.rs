use ledger_device_sdk::nvm::*;
use ledger_device_sdk::NVMData;

// This is necessary to store the object in NVM and not in RAM
pub const BUFFER_SIZE: usize = 4000;
#[link_section = ".nvm_data"]
static mut DATA: NVMData<AlignedStorage<[u8; BUFFER_SIZE]>> =
    NVMData::new(AlignedStorage::new([0u8; BUFFER_SIZE]));

#[derive(Clone, Copy)]
pub struct Buffer;

impl Default for Buffer {
    fn default() -> Self {
        Buffer
    }
}

impl Buffer {
    #[inline(never)]
    #[allow(unused)]
    pub fn get_mut_ref(&mut self) -> &mut AlignedStorage<[u8; BUFFER_SIZE]> {
        unsafe { DATA.get_mut() }
    }

    #[allow(unused)]
    pub fn get_element(&self, index: usize) -> u8 {
        let buffer = unsafe { DATA.get_mut() };
        buffer.get_ref()[index]
    }

    #[allow(unused)]
    pub fn set_element(&self, index: usize, value: u8) {
        let mut updated_data: [u8; BUFFER_SIZE] = unsafe { *DATA.get_mut().get_ref() };
        updated_data[index] = value;
        unsafe {
            DATA.get_mut().update(&updated_data);
        }
    }

    #[allow(unused)]
    pub fn set_slice(&self, mut index: usize, value: &[u8]) {
        let mut updated_data: [u8; BUFFER_SIZE] = unsafe { *DATA.get_mut().get_ref() };
        for b in value.iter() {
            updated_data[index] = *b;
            index += 1;
        }
        unsafe {
            DATA.get_mut().update(&updated_data);
        }
    }

    #[allow(unused)]
    pub fn get_slice(&self, start_pos: usize, end_pos:usize) -> &[u8] {
        let buffer = unsafe { DATA.get_mut() };
        &buffer.get_ref()[start_pos..end_pos]
    }
}
