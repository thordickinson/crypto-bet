var BetFactory = artifacts.require('BetFactory');
var ResultsOracleImpl = artifacts.require('ResultsOracleImpl');

module.exports = async function(deployer){
    const result = await deployer.deploy(BetFactory);
    console.log(result);
    await deployer.deploy(ResultsOracleImpl);
}
