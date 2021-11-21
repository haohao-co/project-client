import React, { Component } from "react";
import NftTradingPlatform from "./contracts/NftTradingPlatform.json";
import getWeb3 from "./getWeb3";

import "./App.css";

const zip = (...arr) => Array.from({ length: Math.max(...arr.map(a => a.length)) }, (_, i) => arr.map(a => a[i]))

class App extends Component {
  state = {
    web3: null,
    accounts: null,
    contract: null,
    tokenURI: null,
    tokenIdForBuying: null,
    tokenIdForSettingPrice: null,
    priceForSettingPrice: null,
    items: [[]]
  };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // get current metamask account
      await window.ethereum.enable();
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

      const tokenURI = null;
      const tokenIdForBuying = null;
      const tokenIdForSettingPrice = null;
      const priceForSettingPrice = null;

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = NftTradingPlatform.networks[networkId];
      const instance = new web3.eth.Contract(
        NftTradingPlatform.abi,
        deployedNetwork && deployedNetwork.address,
      );

      const itemsResponse = await instance.methods.getItems().call();

      this.setState({ web3, accounts, contract: instance, tokenURI, tokenIdForBuying, tokenIdForSettingPrice, priceForSettingPrice, items: itemsResponse });
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  onInit = async () => {
    await window.ethereum.enable();
        const latestAccounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        this.setState({ accounts: latestAccounts})
         window.ethereum.on('accountsChanged', function (accounts) {
            // Time to reload interface with accounts[0]!
            console.log(accounts[0])
           });
  }

  handleCreateToken = async event =>{
    const contract = this.state.contract
    const accounts = this.state.accounts

    const tokenURI = this.state.tokenURI
    await contract.methods.createToken(tokenURI).send({ from: accounts[0] });

    const itemsResponse = await contract.methods.getItems().call();

    // Update state with the result.
    this.setState({ items: itemsResponse });
  };

  handleBuy = async event => {
    const contract = this.state.contract
    const accounts = this.state.accounts
    const tokenId = this.state.tokenIdForBuying
    let tokenIdInt  = parseInt(tokenId);

    const price = await contract.methods.getTokenPrice(tokenIdInt).call();

    // Trigger the buy transaction
    await contract.methods.buy(tokenIdInt).send({ from: accounts[0], value: price });

    const itemsResponse = await contract.methods.getItems().call();

    // Update state with the result.
    this.setState({ items: itemsResponse });
  };

  //handle textbox change
  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }

  handleSetPrice = async event => {
      const tokenId = this.state.tokenIdForSettingPrice;
      const price = this.state.priceForSettingPrice;

      let tokenIdInt  = parseInt(tokenId);
      let priceInt = parseInt(price);

      const contract = this.state.contract
      const accounts = this.state.accounts

      await contract.methods.setTokenPrice(tokenIdInt, priceInt).send({ from: accounts[0] });

      const itemsResponse = await contract.methods.getItems().call();

      // Update state with the result.
      this.setState({ items: itemsResponse });
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <div className="App-header">
          <h1>NFT trading</h1>
          <p>Create token | Set Price | Trade</p>
        </div>
        <div className="flex-container">
          <div className="flex-child magenta">
            <h2>My tokens</h2>
            <br/>
            <label>
              token uri&nbsp;&nbsp;<input type="text" name="tokenURI" onChange={this.handleChange}/>
            </label>
            &nbsp;&nbsp;
            <button onClick={this.handleCreateToken.bind(this)}>Create Token</button>
            <br/><br/><br/>
            
            <label>
              token id&nbsp;&nbsp;
              <input type="text" name="tokenIdForSettingPrice" onChange={this.handleChange}/>
            </label>
            <label>
              &nbsp;&nbsp;
              price&nbsp;&nbsp;
              <input type="text" name="priceForSettingPrice" onChange={this.handleChange}/>
              &nbsp;&nbsp;
            </label>
            <button onClick={this.handleSetPrice}>Set Price</button>
          </div>
          <div className="flex-child green">
            <br/>
            <h2>Trading</h2>
            <br/>
            <label>
              token id&nbsp;&nbsp;<input type="text" name="tokenIdForBuying" onChange={this.handleChange}/>
            </label>
            &nbsp;&nbsp;
            <button onClick={this.handleBuy.bind(this)}>Buy Token</button>
          </div>
        </div>
          
        <div className="centered">
        <h2>Token status</h2>
          <table border="1px solid black" className="centered">
            <thead>
              <tr>
                <th>Token Id</th>
                <th>Price</th>
                <th>Owner</th>
              </tr>
            </thead>
            <tbody>
              {
                this.state.items.map((item, index) => (
                  <tr>
                    <td>{item[0]}</td>
                    <td>{item[1]}</td>
                    <td>{item[2]}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default App;
