use sha2::{Digest, Sha256};

pub fn hash(value: &str) -> Vec<u8> {
  Sha256::digest(value.as_bytes()).to_vec()
}
