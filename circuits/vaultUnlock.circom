pragma circom 2.1.5;

include "poseidon.circom";

template VaultUnlock() {
    signal input secret;
    signal input expectedHash;
    signal output valid;

    component hash = Poseidon(1);
    hash.inputs[0] <== secret;

   valid <== 1 - (hash.out - expectedHash) * (hash.out - expectedHash);

}

component main = VaultUnlock();
