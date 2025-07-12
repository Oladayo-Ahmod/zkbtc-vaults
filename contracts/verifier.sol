// SPDX-License-Identifier: GPL-3.0
/*
    Copyright 2021 0KIMS association.

    This file is generated with [snarkJS](https://github.com/iden3/snarkjs).

    snarkJS is a free software: you can redistribute it and/or modify it
    under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    snarkJS is distributed in the hope that it will be useful, but WITHOUT
    ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
    or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public
    License for more details.

    You should have received a copy of the GNU General Public License
    along with snarkJS. If not, see <https://www.gnu.org/licenses/>.
*/

pragma solidity >=0.7.0 <0.9.0;

contract Groth16Verifier {
    // Scalar field size
    uint256 constant r    = 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    // Base field size
    uint256 constant q   = 21888242871839275222246405745257275088696311157297823662689037894645226208583;

    // Verification Key data
    uint256 constant alphax  = 16729437158043048640317632065944724089378820119410769470092057565527543168219;
    uint256 constant alphay  = 13805403198513032616077734732431231350948531887671719039832018523355674351394;
    uint256 constant betax1  = 14440740995258457189262517167874078935121769977803842301582752566428625007869;
    uint256 constant betax2  = 11177275247194253180074456387056386321214368340365357932766743947924684819878;
    uint256 constant betay1  = 4888195422215463539615285898574669384697320597886375342789516838531025142138;
    uint256 constant betay2  = 7532633746863471462466468959459530081210001498841546067957167375588816567640;
    uint256 constant gammax1 = 11559732032986387107991004021392285783925812861821192530917403151452391805634;
    uint256 constant gammax2 = 10857046999023057135944570762232829481370756359578518086990519993285655852781;
    uint256 constant gammay1 = 4082367875863433681332203403145435568316851327593401208105741076214120093531;
    uint256 constant gammay2 = 8495653923123431417604973247489272438418190587263600148770280649306958101930;
    uint256 constant deltax1 = 10296324260093098172619487647717866147268371158692081222255030554076393247074;
    uint256 constant deltax2 = 12140657045697837023560980664426862917399311106168993988714972467073133243541;
    uint256 constant deltay1 = 8496511237172736177893351153958501162997863921223546617840398990682833137866;
    uint256 constant deltay2 = 4494014680492236642373160686213340485007113291236332781608461324516420522245;

    
    uint256 constant IC0x = 9222997212725200183323912291170737976499025988537083322625164032935925029319;
    uint256 constant IC0y = 2253378496755700177888612728126862669750035560968116117347898199517596828746;
    
    uint256 constant IC1x = 13882121646533829585703724643704614776214957795094901351273052770318695339633;
    uint256 constant IC1y = 11230633768523729466282132686064429433787656989521117854097594564046383991306;
    
 
    // Memory data
    uint16 constant pVk = 0;
    uint16 constant pPairing = 128;

    uint16 constant pLastMem = 896;

function verifyProof(
    uint[2] calldata _pA,
    uint[2][2] calldata _pB,
    uint[2] calldata _pC,
    uint[1] calldata _pubSignals
) public view returns (bool) {
    bool isValid;
    
    assembly {
        function checkField(v) {
            if iszero(lt(v, r)) {
                mstore(0, 0)
                return(0, 0x20)
            }
        }
        
        function g1_mulAccC(pR, x, y, s) {
            let success
            let mIn := mload(0x40)
            mstore(mIn, x)
            mstore(add(mIn, 32), y)
            mstore(add(mIn, 64), s)

            success := staticcall(sub(gas(), 2000), 7, mIn, 96, mIn, 64)

            if iszero(success) {
                mstore(0, 0)
                return(0, 0x20)
            }

            mstore(add(mIn, 64), mload(pR))
            mstore(add(mIn, 96), mload(add(pR, 32)))

            success := staticcall(sub(gas(), 2000), 6, mIn, 128, pR, 64)

            if iszero(success) {
                mstore(0, 0)
                return(0, 0x20)
            }
        }

        function checkPairing(pA, pB, pC, pubSignals, pMem) -> isOk {
            let _pPairing := add(pMem, pPairing)
            let _pVk := add(pMem, pVk)

            mstore(_pVk, IC0x)
            mstore(add(_pVk, 32), IC0y)

            // Compute the linear combination vk_x
            g1_mulAccC(_pVk, IC1x, IC1y, calldataload(add(pubSignals, 0)))

            // -A
            mstore(_pPairing, calldataload(pA))
            mstore(add(_pPairing, 32), mod(sub(q, calldataload(add(pA, 32))), q))

            // B
            mstore(add(_pPairing, 64), calldataload(pB))
            mstore(add(_pPairing, 96), calldataload(add(pB, 32)))
            mstore(add(_pPairing, 128), calldataload(add(pB, 64)))
            mstore(add(_pPairing, 160), calldataload(add(pB, 96)))

            // alpha1
            mstore(add(_pPairing, 192), alphax)
            mstore(add(_pPairing, 224), alphay)

            // beta2
            mstore(add(_pPairing, 256), betax1)
            mstore(add(_pPairing, 288), betax2)
            mstore(add(_pPairing, 320), betay1)
            mstore(add(_pPairing, 352), betay2)

            // vk_x
            mstore(add(_pPairing, 384), mload(add(pMem, pVk)))
            mstore(add(_pPairing, 416), mload(add(pMem, add(pVk, 32))))

            // gamma2
            mstore(add(_pPairing, 448), gammax1)
            mstore(add(_pPairing, 480), gammax2)
            mstore(add(_pPairing, 512), gammay1)
            mstore(add(_pPairing, 544), gammay2)

            // C
            mstore(add(_pPairing, 576), calldataload(pC))
            mstore(add(_pPairing, 608), calldataload(add(pC, 32)))

            // delta2
            mstore(add(_pPairing, 640), deltax1)
            mstore(add(_pPairing, 672), deltax2)
            mstore(add(_pPairing, 704), deltay1)
            mstore(add(_pPairing, 736), deltay2)

            let success := staticcall(sub(gas(), 2000), 8, _pPairing, 768, _pPairing, 0x20)
            isOk := and(success, mload(_pPairing))
        }

        let pMem := mload(0x40)
        mstore(0x40, add(pMem, pLastMem))

        // Validate that all evaluations ∈ F
        checkField(calldataload(add(_pubSignals, 0)))

        // Validate all evaluations
        let result := checkPairing(_pA, _pB, _pC, _pubSignals, pMem)
        isValid := result
    }
    
    return isValid;
}

}
