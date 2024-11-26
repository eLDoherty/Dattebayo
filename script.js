/********************************
**   Author : Leonardo Doherty **
**   Date   : 11/25/2024       **
*********************************/

document.addEventListener('DOMContentLoaded', function() {
    let currentPageAnime = 1;
    let currentPageQuote = 1;
    let totalPagesAnime = 1;
    let totalPagesQuote = 1;
    let currentAnimeName = '';
    const itemsPerPage = 5;

    const animeButton = document.getElementById('animeButton');
    const quoteButton = document.getElementById('quoteButton');
    const keywordSearchInput = document.getElementById('keywordSearchInput');
    const searchByKeywordButton = document.getElementById('searchByKeyword');
    const animeListContainer = document.getElementById('animeList');
    const quoteListContainer = document.getElementById('quoteList');
    const animePagination = document.getElementById('animePagination');
    const quotePagination = document.getElementById('quotePagination');

    // Fetch Anime List
    async function fetchAnimeList(page) {
        animeListContainer.innerHTML = 'Loading...';
        try {
            const response = await fetch(`https://katanime.vercel.app/api/getlistanime?page=${page}`);
            const data = await response.json();
            const animeList = data.result;

            totalPagesAnime = Math.ceil(animeList.length / itemsPerPage);

            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const paginatedAnime = animeList.slice(start, end);

            animeListContainer.innerHTML = '<h3>Anime List</h3>';
            const ul = document.createElement('ul');
            paginatedAnime.forEach(anime => {
                const li = document.createElement('li');
                li.innerHTML = `${anime.anime} - ${anime.totalKata} quotes`;
                li.addEventListener('click', () => onAnimeClick(anime.anime));
                ul.appendChild(li);
            });
            animeListContainer.appendChild(ul);

            displayPagination(animePagination, page, totalPagesAnime, 'anime');
        } catch (error) {
            animeListContainer.innerHTML = 'Failed to load anime list.';
            console.error('Error fetching anime data:', error);
        }
    }

    async function fetchQuotesByAnime(anime, page) {
        quoteListContainer.innerHTML = 'Loading...'; // Show loading state
        try {
            const response = await fetch(`https://katanime.vercel.app/api/getbyanime?anime=${anime}&page=${page}`);
            const data = await response.json();
            
            if (!data.result || !Array.isArray(data.result) || data.result.length === 0) {
                quoteListContainer.innerHTML = `No quotes found for "${anime}".`;
                return;
            }

            const quotes = data.result;

            totalPagesQuote = Math.ceil(quotes.length / itemsPerPage);

            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const paginatedQuotes = quotes.slice(start, end);

            quoteListContainer.innerHTML = `<h3>Quotes from ${anime} (${quotes.length} total)</h3>`;
            const ul = document.createElement('ul');
            paginatedQuotes.forEach(quote => {
                const li = document.createElement('li');
                li.innerHTML = `"${quote.english}" — <strong>${quote.character}</strong> from <em>${quote.anime}</em>`;
                ul.appendChild(li);
            });
            quoteListContainer.appendChild(ul);

            displayPagination(quotePagination, page, totalPagesQuote, 'quoteByAnime');
        } catch (error) {
            quoteListContainer.innerHTML = 'Failed to load quotes.';
            console.error('Error fetching quote data:', error);
        }
    }

    async function fetchRandomQuotes(page) {
        quoteListContainer.innerHTML = 'Loading...';

        try {
            const response = await fetch('https://katanime.vercel.app/api/getrandom');
            const data = await response.json();

            if (!data.result || !Array.isArray(data.result) || data.result.length === 0) {
                quoteListContainer.innerHTML = 'No random quotes found.';
                return;
            }

            const quotes = data.result;

            quoteListContainer.innerHTML = '<h3>Random Quotes</h3>';
            const ul = document.createElement('ul');
            quotes.forEach(quote => {
                const li = document.createElement('li');
                li.innerHTML = `"${quote.english}" — <strong>${quote.character}</strong> from <em>${quote.anime}</em>`;
                ul.appendChild(li);
            });
            quoteListContainer.appendChild(ul);

            quotePagination.innerHTML = '';
        } catch (error) {
            quoteListContainer.innerHTML = 'Failed to load random quotes.';
            console.error('Error fetching random quote data:', error);
        }
    }

    // New search quotes function based on keyword
    async function fetchQuotesByKeyword(keyword, page) {
        quoteListContainer.innerHTML = 'Loading...';

        try {
            const response = await fetch(`https://katanime.vercel.app/api/carikata?kata=${keyword}&page=${page}`);
            const data = await response.json();

            if (!data.result || !Array.isArray(data.result) || data.result.length === 0) {
                quoteListContainer.innerHTML = `No quotes found with the keyword "${keyword}".`;
                return;
            }

            const quotes = data.result;

            totalPagesQuote = Math.ceil(quotes.length / itemsPerPage);

            const start = (page - 1) * itemsPerPage;
            const end = start + itemsPerPage;
            const paginatedQuotes = quotes.slice(start, end);

            quoteListContainer.innerHTML = `<h3>Quotes containing "${keyword}"</h3>`;
            const ul = document.createElement('ul');
            paginatedQuotes.forEach(quote => {
                const li = document.createElement('li');
                li.innerHTML = `"${quote.english}" — <strong>${quote.character}</strong> from <em>${quote.anime}</em>`;
                ul.appendChild(li);
            });
            quoteListContainer.appendChild(ul);

            // Display pagination for the keyword-based search
            displayPagination(quotePagination, page, totalPagesQuote, 'quoteByKeyword');
        } catch (error) {
            quoteListContainer.innerHTML = 'Failed to load quotes for the given keyword.';
            console.error('Error fetching search quote data:', error);
        }
    }


    function displayPagination(container, currentPage, totalPages, type) {
        container.innerHTML = ''; // Clear existing pagination

        const prevButton = document.createElement('button');
        prevButton.innerText = 'Prev';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => onPageChange(type, currentPage - 1));
        container.appendChild(prevButton);

        const nextButton = document.createElement('button');
        nextButton.innerText = 'Next';
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => onPageChange(type, currentPage + 1));
        container.appendChild(nextButton);
    }

    function onPageChange(type, page) {
        if (type === 'anime') {
            fetchAnimeList(page);
            currentPageAnime = page;
        } else if (type === 'quoteByAnime') {
            fetchQuotesByAnime(currentAnimeName, page);
            currentPageQuote = page;
        } else if (type === 'quoteByKeyword') {
            fetchQuotesByKeyword(keywordSearchInput.value, page);
            currentPageQuote = page;
        }
    }

    function onAnimeClick(anime) {
        currentAnimeName = anime;
        fetchQuotesByAnime(anime, 1);
        currentPageQuote = 1;
    }

    // Initialize
    animeButton.addEventListener('click', () => fetchAnimeList(1));
    quoteButton.addEventListener('click', () => fetchRandomQuotes(1));
    searchByKeywordButton.addEventListener('click', () => {
        const keyword = keywordSearchInput.value;
        if (keyword.trim()) {
            fetchQuotesByKeyword(keyword, 1);
            currentPageQuote = 1; // Reset to first page on new search
        }
    });
});
