// create variable to hold db connection
let db;
//// we create the request variable to act as an event listener for the database
//// That event listener is created when we open the connection to the database using the indexedDB.open() method
// establish a connection to IndexedDB database called 'pizza_hunt' and set it to version 1
const request = indexedDB.open("pizza_hunt", 1);

//// note: for above codes
//// The .open() method we use here takes two parameters:
//// 1: The name of the IndexedDB database you'd like to create (if it doesn't exist)
//// or connect to (if it does exist). We'll use the name pizza_hunt
//// 2: The version of the database. By default, we start it at 1

////
//// The listener we just added will handle the event of a change that needs to be made to the database's structure
//// IndexedDB infers that a change needs to be made when the database is first connected (which we're doing now)
//// or if the version number changes
//
// this event will emit if the database version changes (nonexistant to version 1, v1 to v2, etc.)
//// This event only executes when the version of the database has changed
//// or when no database was detected and needs to be created.
request.onupgradeneeded = function (event) {
  // save a reference to the database
  const db = event.target.result;
  // create an object store (table) called `new_pizza`, set it to have an auto incrementing primary key of sorts
  //// new_pizza is the name of the Object Store
  db.createObjectStore("new_pizza", { autoIncrement: true });
};

// upon a successful
request.onsuccess = function (event) {
  // when db is successfully created with its object store (from onupgradedneeded event above) or simply established a connection, save reference to db in global variable
  db = event.target.result;

  // check if app is online, if yes run uploadPizza() function to send all local db data to api
  // Returns a Boolean indicating whether the browser is working online.
  if (navigator.onLine) {
    // we haven't created this yet, but we will soon, so let's comment it out for now
    //// With this uncommented,
    //// we'll check to see if we're online every time this app opens and upload any remnant pizza data
    uploadPizza();
  }
};

request.onerror = function (event) {
  // log error here
  console.log(event.target.errorCode);
};

//// With these event handlers in place,
//// let's get set up to actually save pizza data if there's no internet connection.
//
// 18.4.5
// This function will be executed if we attempt to submit a new pizza and there's no internet connection
function saveRecord(record) {
  // open a new transaction with the database with read and write permissions
  const transaction = db.transaction(["new_pizza"], "readwrite");

  // access the object store for `new_pizza`
  const pizzaObjectStore = transaction.objectStore("new_pizza");

  // add record to your store with add method
  pizzaObjectStore.add(record);
}
//// This saveRecord() function will be used in the add-pizza.js file's form submission function
//// if the fetch() function's .catch() method is executed.
//// Remember, the fetch() function's .catch() method is only executed on network failure!

// 18.4.7
//// for the next, we'll
// create a function that will handle collecting all of the data from the new_pizza object store in IndexedDB
// and POST it to the server

function uploadPizza() {
  // open a transaction on your db
  const transaction = db.transaction(["new_pizza"], "readwrite");

  // access your object store
  const pizzaObjectStore = transaction.objectStore("new_pizza");

  // get all records from store and set to a variable
  const getAll = pizzaObjectStore.getAll();

  // more to come...
  // upon a successful .getAll() execution, run this function
  getAll.onsuccess = function () {
    // if there was data in indexedDb's store, let's send it to the api server
    if (getAll.result.length > 0) {
      fetch("/api/pizzas", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          //// On a successful server interaction, we'll access the object store one more time and empty it
          // open one more transaction
          const transaction = db.transaction(["new_pizza"], "readwrite");
          // access the new_pizza object store
          const pizzaObjectStore = transaction.objectStore("new_pizza");
          // clear all items in your store
          pizzaObjectStore.clear();

          alert("All saved pizza has been submitted!");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

// listen for app coming back online
window.addEventListener("online", uploadPizza);
