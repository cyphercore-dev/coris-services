const MAX_CONCUR = 15;
const RPC_URL = '149.28.228.142';
// const RPC_URL = 'localhost';
const RPC_PORT = 1317;

const http = require('http');
const httpAgent = new http.Agent({ keepAlive: true, maxSockets: MAX_CONCUR });


function completeValidator(validator) {
  return Promise.all([
    getValidatorDelegations(validator.operator_address),
    getValidatorUnbondingDelegations(validator.operator_address),
    getValidatorDistribAndAccount(validator.operator_address),
    getValidatorRewards(validator.operator_address),
    getValidatorOutstandingRewards(validator.operator_address),
    getSigningInfo(validator.consensus_pubkey)
  ])
  .then(arrays => {
    validator.delegations = arrays[0];
    validator.unbonding_delegations = arrays[1];
    validator.distribution = arrays[2][0];
    validator.account = arrays[2][1];
    validator.rewards = arrays[3];
    validator.outstanding_rewards = arrays[4];
    validator.signing_info = arrays[5];

    return validator;
  })
  .then(validator => {
    calculateUnbonding(validator);
    calculateSelfBond(validator);

    return validator;
  });
}

function getAllValidators() {
  return Promise.all([
    getValidators(),
    getValidators('unbonded'),
    getValidators('unbonding')
  ])
  .then(validatorsArrays => { 
    return [].concat.apply([], validatorsArrays);
  });  
}

function getValidators(status = 'bonded') {
  return new Promise ((resolve, reject) => {
    const options = {
      hostname: RPC_URL,
      port: RPC_PORT,
      path: `/staking/validators?status=${status}`,
      method: 'GET',
      agent: httpAgent
    };

    let body = '';

    const req = http.request(options, (res) => {
      res.setEncoding('utf8');
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        resolve( JSON.parse(body) );
      });
    });

    req.on('error', (e) => {
      reject(e.message);
    });

    req.end();
  });
}

function getValidatorDelegations(address) {
  return new Promise ((resolve, reject) => {
    const options = {
      hostname: RPC_URL,
      port: RPC_PORT,
      path: `/staking/validators/${address}/delegations`,
      method: 'GET',
      agent: httpAgent
    };

    let body = '';

    const req = http.request(options, (res) => {
      res.setEncoding('utf8');
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        resolve( JSON.parse(body) );
      });
    });

    req.on('error', (e) => {
      reject(e.message);
    });

    req.end();
  });
}


function getValidatorUnbondingDelegations(address) {
  return new Promise ((resolve, reject) => {
    const options = {
      hostname: RPC_URL,
      port: RPC_PORT,
      path: `/staking/validators/${address}/unbonding_delegations`,
      method: 'GET',
      agent: httpAgent
    };

    let body = '';

    const req = http.request(options, (res) => {
      res.setEncoding('utf8');
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        resolve( JSON.parse(body) );
      });
    });

    req.on('error', (e) => {
      reject(e.message);
    });

    req.end();
  });
}


function getValidatorDistribAndAccount(address) {
  return new Promise ((resolve, reject) => {
    getValidatorDistribution(address).then(distribution => {
      getAccountInfo(distribution.operator_address).then(account => {
        resolve([distribution, account]);
      }).catch(e => reject(e.message));
    }).catch(e => reject(e.message));
  });
}

function getValidatorDistribution(address) {
  return new Promise ((resolve, reject) => {
    const options = {
      hostname: RPC_URL,
      port: RPC_PORT,
      path: `/distribution/validators/${address}`,
      method: 'GET',
      agent: httpAgent
    };

    let body = '';

    const req = http.request(options, (res) => {
      res.setEncoding('utf8');
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        resolve( JSON.parse(body) );
      });
    });

    req.on('error', (e) => {
      reject(e.message);
    });

    req.end();
  });
}

function getValidatorRewards(address) {
  return new Promise ((resolve, reject) => {
    const options = {
      hostname: RPC_URL,
      port: RPC_PORT,
      path: `/distribution/validators/${address}/outstanding_rewards`,
      method: 'GET',
      agent: httpAgent
    };

    let body = '';

    const req = http.request(options, (res) => {
      res.setEncoding('utf8');
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        resolve( JSON.parse(body) );
      });
    });

    req.on('error', (e) => {
      reject(e.message);
    });

    req.end();
  });
}


function getValidatorOutstandingRewards(address) {
  return new Promise ((resolve, reject) => {
    const options = {
      hostname: RPC_URL,
      port: RPC_PORT,
      path: `/distribution/validators/${address}/rewards`,
      method: 'GET',
      agent: httpAgent
    };

    let body = '';

    const req = http.request(options, (res) => {
      res.setEncoding('utf8');
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        resolve( JSON.parse(body) );
      });
    });

    req.on('error', (e) => {
      reject(e.message);
    });

    req.end();
  });
}

function getAccountInfo(address) {
  return new Promise ((resolve, reject) => {
    const options = {
      hostname: RPC_URL,
      port: RPC_PORT,
      path: `/auth/accounts/${address}`,
      method: 'GET',
      agent: httpAgent
    };

    let body = '';

    const req = http.request(options, (res) => {
      res.setEncoding('utf8');
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        resolve( JSON.parse(body) );
      });
    });

    req.on('error', (e) => {
      reject(e.message);
    });

    req.end();
  });
}


function getSigningInfo(publicKey) {
  return new Promise ((resolve, reject) => {
    const options = {
      hostname: RPC_URL,
      port: RPC_PORT,
      path: `/slashing/validators/${publicKey}/signing_info`,
      method: 'GET',
      agent: httpAgent
    };

    let body = '';

    const req = http.request(options, (res) => {
      res.setEncoding('utf8');
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        resolve( JSON.parse(body) );
      });
    });

    req.on('error', (e) => {
      reject(e.message);
    });

    req.end();
  });
}


function calculateSelfBond(validator) {
  validator.self_bond_total = 0;
  if(validator.delegations) {
    for(delegation of validator.delegations) {
      if( delegation.delegator_address === validator.distribution.operator_address ) {
        validator.self_bond_total += Number( delegation.shares);
      }
    }
  }
}

function calculateUnbonding(validator) {
  validator.unbonding_total = 0;
  if(validator.unbonding_delegations) {
    for(delegation of validator.unbonding_delegations) {
      for(entry of delegation.entries) {
        validator.unbonding_total += parseInt(entry.balance, 10);
      }
    }
  }
}

module.exports = {
  calculateSelfBond,
  calculateUnbonding,
  completeValidator,
  getAccountInfo,
  getAllValidators,
  getSigningInfo,
  getValidatorDelegations,
  getValidatorDistribAndAccount,
  getValidatorDistribution,
  getValidatorOutstandingRewards,
  getValidatorRewards,
  getValidatorUnbondingDelegations,
  getValidators,
}