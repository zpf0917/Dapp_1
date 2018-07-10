// App is an object with several functions defined
App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',

  // initialise app: initialize web3
  init: function() {
    return App.initWeb3();
  },

  // The def of initialize web3
      // Connects client-side application to our local blockchain
  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
          // MetaMask turns chrome web browser into a blockchain browser
          // So that it connects to Ethereum network

      // When we login to MetaMask, it provides us with a web3 provider
      // We then set the app's web3 provider to our given web 3 provider
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  // Once initialized web3, initialize our contract
      // Loads up our contract into our front end application so that we can interact with it
  initContract: function() {
    // load a Json file of our Contract_1 artifect
        // the getJSON works for this "Contract_1.json" file because we're using the browser sync package
        // "bs-config.json" that comes with the truffle box
        // which is configured to read JSON files out the build contracts directory
    $.getJSON("Contract_1.json", function(contract_1) {
      // Instantiate a new truffle contract from the artifact
          // The truffle contract is the one that we can interact with inside the actual app
      App.contracts.Contract_1 = TruffleContract(contract_1);
      // Connect provider to interact with contract
      App.contracts.Contract_1.setProvider(App.web3Provider);

      App.listenForEvents(); // Call this function whenever initializing the contract

      return App.render();
    });
  },

  // The listening function corresponding to the event
  listenForEvents: function() {
    App.contracts.Contract_1.deployed().then(function(instance) {

      // Restart chrome if unable to receive this event
      
      instance.refreshEvent({}, { // First {} is given by Solidity as filter of event
        fromBlock: 0,           // Meta Data passed to event: subscribe event on the entire blockchain
        toBlock: 'latest'
      }).watch(function(error, event) { // "watch" is to subscribe to this event 
        // upon trigger, log it and re-render the app
        console.log("event triggered", event)
        App.render(); 
      });
    });
  },

  // Once contract is initialized, we'll render out our content on the web page
      // layout all the content on the page
      // Display the account that we have connected with the blockchain with
      // List out all the candidates in the contract
  render: function() {
    var contractInstance;
    // Keep track of the loading template and content template
    var loader = $("#loader");
    var content = $("#content");
    var opener = $("#opener");

    content.hide();
    opener.hide();
    loader.show();
  
    // Load account data
        // "getCoinbase" provides us with the account
    web3.eth.getCoinbase(function(err, account) { // account injected into the function
      if (err === null) {
        // Account in our app set to this account
        App.account = account;
        // Display the account in html
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
        // Get a copy of the deployed contract, assign it to contractInstance declared before
    App.contracts.Contract_1.deployed().then(function(instance) {
      contractInstance = instance;
      return contractInstance.boxCount();
    }).then(function(boxCount) {
      var individualMoney = $("#individualMoney");
      individualMoney.empty(); 

      var targetSelect = $("#targetSelect");
      targetSelect.empty();

      var id;
      var address;
      var money;

      for (var i = 1; i <= boxCount; i++) {
        contractInstance.BoxAddress(i).then(function(myAddress) {
          id = i;
          address = myAddress;
          return contractInstance.Money(address);
        }).then(function(myMoney){
          money = myMoney;

          // Render candidate Result
          var displayTemplate = "<tr><th>" + id + "</th><td>" + address + "</td><td>" + money + "</td></tr>";
          individualMoney.append(displayTemplate);

          if(address != App.account){
            var targetOption = "<option value='" + address +"' >" + id +"-----"+ address + "</ option>";
            targetSelect.append(targetOption);
          }  
        });
      }

      return contractInstance.AddressBool(App.account);
    }).then(function(alreadyOpen) {
      if (alreadyOpen) {
        opener.hide();
        loader.hide();
        content.show();
      } else {
        loader.hide();
        content.hide();
        opener.show();
      }
    }).catch(function(error) {
      console.warn(error);
    });
  },

  // deposit in index.html
  deposit: function() {
    App.contracts.Contract_1.deployed().then(function(instance) {
      instance.deposit({from: App.account});
    }).then(function(){
      $("#opener").hide();
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  },

  withdraw: function() {
    App.contracts.Contract_1.deployed().then(function(instance) {
      instance.withdraw({from: App.account});
    }).then(function(){
      $("#opener").hide();
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  },

  transfer: function() {
    var targetAddress = $('#targetSelect').val();
    App.contracts.Contract_1.deployed().then(function(instance) {
      instance.transfer(targetAddress, {from: App.account});
    }).then(function(){
      $("#opener").hide();
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  },

  openAccount: function() {
    App.contracts.Contract_1.deployed().then(function(instance) {
      instance.open();
    }).then(function(){
      $("#opener").hide();
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  }
};




// app initialised whenever the window loads
$(function() {
  $(window).load(function() {
    App.init();
  });
});