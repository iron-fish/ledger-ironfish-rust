use crate::utils::Bip32Path;

pub struct TxContext {
    pub buffer_pos: usize,
    pub done: bool
}

// Implement constructor for TxInfo with default values
impl TxContext {
    // Constructor
    pub fn new() -> TxContext {
        TxContext {
            buffer_pos: 0,
            done: false
        }
    }

    // Implement reset for TxInfo
    pub fn reset(&mut self) {
        self.buffer_pos = 0;
        self.done = false;
    }
}