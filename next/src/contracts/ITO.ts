const ITO = {
  name: 'InTime',
  symbol: 'ITO',
  decimal: 18,
  gasLimit: 100000,
  address: '0x293B0Cd0991DB07c8529fEBb01bc7D052315C5Ab',
  ABI: [
    {
      constant: true,
      inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
      payable: false,
      stateMutability: 'view',
      type: 'function',
    },
    {
      constant: false,
      inputs: [
        { internalType: 'address', name: 'recipient', type: 'address' },
        { internalType: 'uint256', name: 'amount', type: 'uint256' },
      ],
      name: 'transfer',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      payable: false,
      stateMutability: 'nonpayable',
      type: 'function',
    },
  ],
};

export default ITO;
