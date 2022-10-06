const pages = document.querySelectorAll("#first #further");
const pageNumbersContainer = document.querySelector(".pagination pagination-lg");

if (pageNumbersContainer) {

	const createPagination = () => {
	    pages.forEach((p, i) => {
	        const pageNumber = document.createElement("div");
	        pageNumber.classList.add("further-number");
	        pageNumber.textContent = i + 1;
	        pageNumber.addEventListener("click", () => {
	            activatePage(i);
	        })

	        pageNumbersContainer.appendChild(pageNumber);
	    })

	    document.querySelector("#further-number").classList.add("active");
	}

	createPagination();

	const pageNumbers = document.querySelectorAll(".pagination pagination-lg #further-number");

	const activatePage = (pageNumber) => {
	    pages.forEach(p => {
	        p.classList.remove("active");
	    })

	    pages[pageNumber].classList.add("active");

	    pageNumbers.forEach(p => {
	        p.classList.remove("active");
	    })

	    pageNumbers[pageNumber].classList.add("active");

	    window.scroll(0, 0);
	}
	
}