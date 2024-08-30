use alloc::vec::Vec;
use crate::utils::Bip32Path;

pub struct TxContext {
    pub raw_tx: Vec<u8>,
    pub path: Bip32Path,
    pub review_finished: bool,
}

// Implement constructor for TxInfo with default values
impl TxContext {
    // Constructor
    pub fn new() -> TxContext {
        TxContext {
            raw_tx: Vec::new(),
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
        // Clean all values on the vec
        self.raw_tx.clear();
        // Recover the space from the heap (clear does not release the space from the heap)
        self.raw_tx.shrink_to_fit();

        self.path = Default::default();
        self.review_finished = false;
    }
}