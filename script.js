const searchBtn = document.getElementById('search-btn');
const countryInput = document.getElementById('country-input');
const countryInfo = document.getElementById('country-info');
const borderSection = document.getElementById('bordering-countries');
const spinner = document.getElementById('loading-spinner');

async function searchCountry(countryName) {
    if(!countryName) return;
    
    spinner.style.display = 'block';
    countryInfo.innerHTML = '';
    borderSection.innerHTML = '';
    document.getElementById('error-message').style.display = 'none';
    
    try {
        const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}?fullText=true`);
        
        if (!response.ok){
            throw new Error('Country not found. Please try again.');
        }
        
        const data = await response.json();
        
        // Filter to only show sovereign countries (not territories/regions)
        const country = data.find(c => c.independent !== false);
        
        if (!country) {
            throw new Error('Country not found. Please try again.');
        }
        
        countryInfo.innerHTML = `
            <h2>${country.name.common}</h2>
            <p><strong>Capital:</strong> ${country.capital[0]}</p>
            <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
            <p><strong>Region:</strong> ${country.region}</p>
            <img src="${country.flags.svg}" alt="${country.name.common} flag">
        `;
        
        if (country.borders && country.borders.length > 0){
            borderSection.innerHTML = '<h3>Bordering Countries:</h3><div class="border-grid"></div>';
            const grid = borderSection.querySelector('.border-grid');
            
            const borderPromises = country.borders.map(code =>
                fetch(`https://restcountries.com/v3.1/alpha/${code}`).then(res => res.json())
            );
            
            const borderDataArray = await Promise.all(borderPromises);
            
            borderDataArray.forEach(borderData => {
                const neighbor = borderData[0];
                grid.innerHTML += `
                <div class="border-item">
                    <p>${neighbor.name.common}</p>
                    <img src="${neighbor.flags.svg}" alt="${neighbor.name.common} flag" width="50">
                </div>
                `;
            });
        }else{
            borderSection.innerHTML = '<p>This country has no land borders.</p>';
        }

    } catch (error) {
        // Show error message
        const errorElement = document.getElementById('error-message');
        errorElement.textContent = error.message;
        errorElement.style.display = 'block';
    } finally {
        // Hide loading spinner
        spinner.style.display = 'none';
    }
}

// Event listeners
searchBtn.addEventListener('click', () => {
    searchCountry(countryInput.value.trim());
});

countryInput.addEventListener('keypress', (e) =>{
    if(e.key === 'Enter'){
        searchCountry(countryInput.value.trim());
    }
});

