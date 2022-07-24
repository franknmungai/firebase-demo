import { initializeApp } from 'firebase/app';

import {
  addDoc,
  onSnapshot,
  collection,
  getFirestore,
  getDocs,
  query,
  orderBy,
  limit,
  deleteDoc,
  doc,
  setDoc,
} from 'firebase/firestore';

import { $ } from './utils';

import firebaseConfig from './utils/firebase-config';

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const products = '/products';

let editMode = false;
let updateId;

export async function createProduct(productDetails) {
  try {
    await addDoc(collection(db, products), productDetails);
  } catch (error) {
    console.log(error);
  }
}

async function getProducts() {
  try {
    const productsRef = collection(db, products);

    // Create a query against the collection.
    const q = query(productsRef, orderBy('price', 'desc'), limit(3));

    const prodDocs = await getDocs(q);
    const productsData = prodDocs.docs.map((doc) =>
      Object.assign({}, doc.data(), { id: doc.id })
    );

    renderProducts(productsData);
  } catch (error) {
    console.log(error);
  }
}

// add event listeners

$('#create').addEventListener('click', function (event) {
  event.preventDefault();
  const name = $('#name').value;
  const price = $('#price').value;
  const quantity = $('#quantity').value;
  const category = $('#category').value;
  const productDetails = {
    name,
    price,
    quantity,
    category,
    createdAt: new Date().toISOString(),
    imageUrl: '',
  };
  if (!editMode) {
    createProduct(productDetails)
      .then(() => {
        alert('Product created successfully!');
      })
      .catch((e) => {
        console.log(e);
        alert('Error creating the product');
      });
  } else {
    updateProduct(updateId, productDetails)
      .then(() => {
        alert('product updated Successfully');
      })
      .catch((e) => console.log(e))
      .finally(() => {
        editMode = false;
      });
  }
});

getProducts();

function renderProducts(productsData) {
  $('#products').innerHTML = productsData
    .map(
      (prod) => `
          <div class="product" data-id=${prod.id}>
              <h2 id="${prod.id}-name">${prod.name}</h2>
              <br/>
              <bold id="${prod.id}-price">Price: ${prod.price}</bold>
              <p id="${prod.id}-quantity">Quantity: ${prod.quantity}</p>
              <i id="${prod.id}-category">Category: ${prod.category}</i>

              <br/>
              <br/>
              <button class="delete">Delete</button>
              <button class="edit">Edit</button>
          </div>
      `
    )
    .join('');

  $('.product').forEach((el) => {
    const id = el.dataset.id;

    el.querySelector('.delete').onclick = function () {
      //   alert(id);

      deleteDoc(doc(db, products, id))
        .then(() => alert('Product deleted'))
        .catch((e) => {
          console.log(e);
        });
    };
    el.querySelector('.edit').onclick = function () {
      $('#name').value = $(`#${id}-name`).textContent;
      $('#price').value = $(`#${id}-price`).textContent;
      $('#quantity').value = $(`#${id}-quantity`).textContent;
      $('#category').value = $(`#${id}-category`).textContent;
      editMode = true;
      updateId = id;
    };
  });
}

const unsub = onSnapshot(collection(db, products), (data) => {
  const productsData = data.docs.map((doc) => {
    return {
      ...doc.data(),
      id: doc.id,
    };
  });
  renderProducts(productsData);
});

function updateProduct(id, productDetails) {
  return setDoc(doc(db, products, id), productDetails);
}
