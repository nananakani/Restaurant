let allProducts = [];

async function fetchCategories() {
    try{
        const response= await fetch("https://restaurant.stepprojects.ge/api/Categories/GetAll");

        const Categories=await response.json();
        displayCategories(Categories);
    }catch(error){
        console.error("Error Fetching Categories:", error)
        document.getElementById("categories").innerHTML=`<p>Error loading categories</p>`
    }
}

function displayCategories(Categories){
  const categoriesContainer= document.getElementById("categories");
  const categoriesHtml = Categories.map(
    (category)=>`
     <li class="products-category">
            <a data-id=${category.id} href="#">${category.name}<a>
            </li>
              `
        ).join("")
        categoriesContainer.innerHTML=categoriesHtml

        const links = categoriesContainer.querySelectorAll("a");
  links.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const categoryId = Number(link.dataset.id);
      filterProductsByCategory(categoryId);
    });
  });
  
}

window.addEventListener("load", fetchCategories);


async function fetchproducts() {
    try{
    const response= await fetch('https://restaurant.stepprojects.ge/api/Products/GetAll')
   
    const products= await response.json();
      allProducts = products
    displayproducts(products);
 }
    catch(error){
    console.error("Error Fetching products:", error)
        document.getElementById("products").innerHTML='<p>Error loading products</p>';

}
}
function displayproducts(products){
        const productsContainer=document.getElementById("products");
        const productsHtml=products.map(
            (product)=>`
            <div data-id=${product.id} class="products-card">
            <img src="${product.image}" alt="${product.name}" class="product-img">
            <h3>${product.name}</h3>
            <p>Price:${product.price}$</p>
            <p>Category:${product.categoryId}</p>
            ${product.vegeterian ? `<span class="tag">Vegetarian</span>`:""}
            ${product.nuts ? `<span class="tag">Contains Nuts </span>`:""}
            ${product.spiciness > 0 ? `<span class="tag"> Spicy (${product.spiciness}) </span>`: ""}
            <button onclick="addToCart(${product.id})">Cart</button>
            </div>
              `
        ).join("")
        productsContainer.innerHTML=productsHtml
    }
    function addToCart(productId) {
    console.log("დამატებულია კალათაში:", productId);
}
window.addEventListener("load",fetchproducts);


function getFilterOptions() {
  return {
    spiciness: document.getElementById("spicerange").value,
    nuts: document.getElementById("Containsnuts").checked,
    vegeterian: document.getElementById("vegetarianonly").checked,
    categoryId:""
  };
}


const vegBtn= document.getElementById("vegetarianonly")

const nutsBtn=document.getElementById("Containsnuts");


function filterProductsByCategory(categoryId) {
  const filtered = allProducts.filter((product) => product.categoryId === categoryId);
  displayproducts(filtered);
}


function buttonFilters(){
    const vegBtn = document.getElementById("vegetarianonly");
    const nutsBtn = document.getElementById("Containsnuts");
    const spicinessRange = document.getElementById("spicerange");
    const resetBtn = document.getElementById("resetbtn");
    const applyBtn = document.getElementById("applyfilterbtn")

    function filters(){

        let filtered=allProducts;

        if(vegBtn.checked){
            filtered=filtered.filter((product)=>product.vegeterian)
        }
        
        if(nutsBtn.checked){
            filtered=filtered.filter((product)=>product.nuts)
        }

        const spiciness=Number(spicinessRange.value);
        if(spiciness>0){
            filtered=filtered.filter((product)=>product.spiciness===spiciness)
        }
        displayproducts(filtered)
    }

    vegBtn.addEventListener("change", filters)
    nutsBtn.addEventListener("change", filters)
    spicinessRange.addEventListener("input", filters)



     resetBtn.addEventListener("click",()=>{
        vegBtn.checked = false;
        nutsBtn.checked = false;
        spicinessRange.value = 0;
        displayproducts(allProducts)
     })
}
buttonFilters()


function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Product added to cart!');
}
