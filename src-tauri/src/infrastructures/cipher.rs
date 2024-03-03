use aes_gcm::{aes::Aes256, Aes256Gcm, AesGcm, KeyInit};
use pbkdf2::pbkdf2_hmac_array;
use sha2::{
  digest::{
    consts::{B0, B1},
    typenum::{UInt, UTerm},
  },
  Sha256,
};

type CipherPart = (
  [u8; 12],
  AesGcm<Aes256, UInt<UInt<UInt<UInt<UTerm, B1>, B1>, B0>, B0>>,
);

pub fn create_cipher(secret: &str, salt: &str, nonce: &str) -> CipherPart {
  let key = pbkdf2_hmac_array::<Sha256, 32>(secret.as_bytes(), salt.as_bytes(), 8);
  let nonce = pbkdf2_hmac_array::<Sha256, 12>(nonce.as_bytes(), salt.as_bytes(), 8);
  let cipher = Aes256Gcm::new((&key).into());

  (nonce, cipher)
}
