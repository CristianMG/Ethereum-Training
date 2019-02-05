const assert = require('assert');
const AssertionError = require('assert').AssertionError;

const Web3 = require('web3');


const provider = new Web3.providers.HttpProvider("HTTP://127.0.0.1:7545");
const web3 = new Web3(provider);

const { interface, bytecode } = require('../scripts/compile');

let accounts;
let usersContract;


beforeEach(async () => {
    accounts = await web3.eth.getAccounts();
    usersContract = await new web3.eth.Contract(JSON.parse(interface))
        .deploy({ data: bytecode })
        .send({ from: accounts[0], gas: '1000000' })
});


describe('The UsersContrac', async () => {

    it('Should deploy', () => {
        console.log(usersContract.options.address);
        assert.ok(usersContract.options.address);
    });

    it('should join a user', async () => {
        let name = "Cristian";
        let surname = "Menarguez";
        await usersContract.methods.join(name, surname)
            .send({ from: accounts[0], gas: '500000' })
    });

    it('should retrieve a user', async () => {
        let name = "Cristian";
        let surname = "Menarguez";

        await usersContract.methods.join(name, surname)
            .send({ from: accounts[0], gas: '500000' })

        let user = await usersContract.methods.getUser(accounts[0]).call();

        assert.equal(name, user[0]);
        assert.equal(surname, user[1]);
    })

    it('should not allow joining an account twice', async () => {

        await usersContract.methods.join("Pedro", "Lopez")
            .send({ from: accounts[1], gas: '500000' })

        try {
            await usersContract.methods.join("Ana", "Guerra")
                .send({ from: accounts[1], gas: '500000' })
            assert.fail("same account cant join twice")
        } catch (e) {
            if (e instanceof AssertionError) {
                assert.fail(e.message)
            }
        }

    });



    it('The user should not be returned if it does not exist', async () => {

        await usersContract.methods.join("Pedro", "Lopez")
            .send({ from: accounts[1], gas: '500000' })

        try {
            await usersContract.methods.getUser(account[2]).call();
            assert.fail("You can check another user")
        } catch (e) {
            if (e instanceof AssertionError) {
                assert.fail(e.message)
            }
        }

    });



    it('Check size user is correct', async () => {

        await usersContract.methods.join("Pedro", "Lopez")
            .send({ from: accounts[1], gas: '500000' })
            let size = await usersContract.methods.totalUsers().call()
            assert.ok(size == 10)
    });


});