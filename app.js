
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
            <a data-id="${category.id}" href="#">"${category.name}"<a>
            </li>
              `
        ).join("")
        categoriesContainer.innerHTML=categoriesHtml
  
}

window.addEventListener("load", fetchCategories);

async function fetchproducts() {
    try{
    const response= await fetch('https://restaurant.stepprojects.ge/api/Products/GetAll')
   
    const products= await response.json()
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
            <div class="products-card">
            <img src="${product.image}" alt="${product.name}" class="product-img">
            <h3>${product.name}</h3>
            <p>Price:${product.price}$</p>
            <p>Category:${product.categoryId}</p>
            ${product.vegeterian ? `<span class="tag">Vegetarian</span>`:""}
            ${product.nuts ? `<span class="tag">Contains Nuts </span>`:""}
            ${product.spiciness > 0 ? `<span class="tag"> Spicy (${product.spiciness}) </span>`: ""}
            <button onclick="addToCart(${product.id})">კალათაში</button>
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

// async function fetchFilteredProducts(options) {
//   const params = new URLSearchParams();

//   if (options.spiciness !== undefined) {
//     params.append("spiciness", options.spiciness);
//   }

//   if (options.nuts) {
//     params.append("nuts", "true");
//   }

//   if (options.vegeterian) {
//     params.append("vegeterian", "true");
//   }

//   if (options.categoryId) {
//     params.append("categoryId", options.categoryId);
//   }

//   try {
//     const response = await fetch(`https://restaurant.stepprojects.ge/api/Products/GetFiltered?${params.toString()}`);
//     const filteredProducts = await response.json();
//     displayproducts(filteredProducts);
//   } catch (error) {
//     console.error("შეცდომა ფილტრისას:", error);
//     document.getElementById("products").innerHTML = '<p>შეცდომა ფილტრისას</p>';
//   }
// }

// document.getElementById("applyfilterbtn").addEventListener("click", () => {
//   const options = getFilterOptions();
//   fetchFilteredProducts(options);
// });
//   document.getElementById("resetbtn").addEventListener("click", () => {
//   document.getElementById("spicerange").value = 0;
//   document.getElementById("Containsnuts").checked = false;
//   document.getElementById("vegetarianonly").checked = false;
// });
 