const BetFactory = artifacts.require('BetFactory');
const Oracle = artifacts.require('ResultsOracleImpl');
const Bet = artifacts.require('Bet')


contract('BetFactory', (accounts) => {
    let factory;
    let oracle;
    before(async () => {
        factory = await BetFactory.deployed();
        oracle = await Oracle.deployed();
    });

    describe("Test Factory", async () => {
        it("Setting manager as non manager", async () => {
            try {
                await factory.setManager(accounts[1], { from: accounts[4] })
                assert.fail("This should fail");
            } catch (e) {
                assert.isOk(e.reason && e.reason.startsWith("0x200:"))
            }
        });
        it("Setting bad oracle address", async () => {
            try {
                await factory.setOracleAddress("0x0000000000000000000000000000000000000000")
                assert.fail("Execution shouldn't reach this part")
            } catch (e) {
                assert.isOk(e.reason && e.reason.startsWith("0x201:"))
            }
        });
        it("Testing oracle connection", async () => {
            const connected = await oracle.testConnection();
            assert.isOk(connected, "Connection to oracle failed")
            try {
                await factory.setOracleAddress(oracle.address);
            } catch (e) {
                assert.fail("Error setting oracle address");
            }
        })

        it("Create Bet", async () => {
            const betReceipt = await factory.createBet(12313, 1000, { from: accounts[1] });
            const count = await factory.betListCount();
            assert.equal(count.toNumber(), 1, "Invalid bet count");
            const betAddress = betReceipt.logs[0].args[0];
            const bet = await Bet.at(betAddress)
            const value = await bet.getManager();
            assert.equal(value, accounts[0], "Manager is not the 0 account")
        })
    })
})
