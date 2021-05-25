const BetFactory = artifacts.require('BetFactory');
const Oracle = artifacts.require('ResultsOracleImpl');
const Bet = artifacts.require('Bet')



contract("Bet", (accounts) => {

    let bet;
    let factory;
    let oracle;
    before(async () => {
        oracle = await Oracle.deployed();
        await oracle.setResult(123, 1, 1, { from: accounts[0] })
        factory = await BetFactory.deployed();
        await factory.setOracleAddress(oracle.address);
    })

    beforeEach(async () => {
        const betReceipt = await factory.createBet(123, 1000)
        const betAddress = betReceipt.logs[0].args[0];
        bet = await Bet.at(betAddress);
    })

    describe("Test Consistency", () => {
        it("Testing match Id", async () => {
            const matchId = await bet.getMatchId();
            assert.equal(matchId.toNumber(), 123, "Invalid match id");
        })
    })

    describe("Placing bet", () => {
        it("Place a lower value", async () => {
            try {
                await bet.placeBet(0, 0, { from: accounts[1], value: 999 });
                assert.fail("Test should have failed");
            } catch (e) {
                assert.isOk(e.reason && e.reason.startsWith("0x002:")) //0x002: Need to give more ether
            }
        })
        it("Placing a bet twice", async () => {
            await bet.placeBet(0, 0, { from: accounts[6], value: 1000 });
            try {
                await bet.placeBet(0, 0, { from: accounts[6], value: 1000 });
            } catch (e) {
                assert.isOk(e.reason && e.reason.startsWith("0x003:")) //0x003: Already on the bet
            }
        })
    })

    describe("Happy Path [single winner]", async () => {
        
        it("Happy path [Single winner]", async () => {
            
            await bet.placeBet(0, 0, { from: accounts[1], value: 1000 });
            await bet.placeBet(1, 0, { from: accounts[2], value: 1000 });
            await bet.placeBet(1, 1, { from: accounts[3], value: 1000 });
            await bet.placeBet(0, 1, { from: accounts[4], value: 1000 });


            let contractBalance = await web3.eth.getBalance(bet.address)
            assert.equal(contractBalance, 4000, "Invalid contract balance")
            const balanceBefore = web3.utils.toBN(await web3.eth.getBalance(accounts[3]))
            await bet.findWinner();
            const balanceAfter = web3.utils.toBN(await web3.eth.getBalance(accounts[3]))
            const delta = balanceAfter.sub(balanceBefore)
            assert.equal(delta.toNumber(), 4000, "Delta balance is not the expected")
            contractBalance = await web3.eth.getBalance(bet.address);
            assert.equal(contractBalance, 0, "Balance is not zero")
        })

        it("Can't bet after closed", async() => {
            try{
                await bet.placeBet(0, 1, {from: accounts[6], value: 1000});
                assert.fail("Shouldn't reach this line");
            }catch(e){
                assert.isOk(e.reason && e.reason.startsWith("0x004:")) //0x004: Bet is closed
            }
        })
        
    }) 

    describe("Happy path [Multiple Winner]", async() =>{
        it("Happy path [Multiple Winner]", async () => {
  
            await bet.placeBet(0, 0, { from: accounts[1], value: 1000 });
            await bet.placeBet(1, 0, { from: accounts[2], value: 1000 });
            await bet.placeBet(1, 1, { from: accounts[3], value: 1000 });
            await bet.placeBet(0, 1, { from: accounts[4], value: 1000 });
            await bet.placeBet(1, 1, { from: accounts[5], value: 1000 });
  
            const initialBalance5 = web3.utils.toBN(await web3.eth.getBalance(accounts[5]))
            const initialBalance3 = web3.utils.toBN(await web3.eth.getBalance(accounts[3]))

            let contractBalance = await web3.eth.getBalance(bet.address)
            assert.equal(contractBalance, 5000, "Invalid contract balance")
            await bet.findWinner();
            const actualBalance5 = web3.utils.toBN(await web3.eth.getBalance(accounts[5]))
            const actualBalance3 = web3.utils.toBN(await web3.eth.getBalance(accounts[3]))
            const delta5 = actualBalance5.sub(initialBalance5)
            const delta3 = actualBalance3.sub(initialBalance3)
            assert.equal(delta5.toNumber(), 2500, "Delta balance of account 5 is not the expected")
            assert.equal(delta3.toNumber(), 2500, "Delta balance of account 3 is not the expected")

            contractBalance = await web3.eth.getBalance(bet.address)
            assert.equal(contractBalance, 0, "Contract balance is not zero")

        })
    })

})
