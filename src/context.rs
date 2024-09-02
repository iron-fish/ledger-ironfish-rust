use alloc::vec::Vec;
use crate::utils::Bip32Path;

pub struct TxContext {
    pub buffer_pos: usize,
    pub path: Bip32Path,
    pub review_finished: bool,
}

// Implement constructor for TxInfo with default values
impl TxContext {
    // Constructor
    pub fn new() -> TxContext {
        TxContext {
            buffer_pos: 0,
            path: Default::default(),
            review_finished: false,
        }
    }
    // Get review status
    #[allow(dead_code)]
    pub fn finished(&self) -> bool {
        self.review_finished
    }
    // Implement reset for TxInfo
    pub fn reset(&mut self) {
        self.buffer_pos = 0;
        self.path = Default::default();
        self.review_finished = false;
    }
}