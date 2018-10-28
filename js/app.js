// https://medium.freecodecamp.org/environment-settings-in-javascript-apps-c5f9744282b6
const baseUrl =  window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://commitperhoursserver.herokuapp.com';


const searchForm = document.getElementById('search-form');
let chart = null;

function getCommitsHour(username, repo) {
  return fetch(`${baseUrl}/repos/${username}/${repo}/commits`)
    .then(res => res.json());
}

function updateChart({ labels, data, backgroundColor }) {
  const chartLanguages = document.getElementById('chart-hours');
  const ctx = chartLanguages.getContext('2d');
  const options = {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor,
      }],
    },
    options: {
      legend: {
        display: false
      },
      scales: {
        xAxes: [{
          ticks: {
            fontFamily: "'Roboto Mono'",
            fontSize: 12,
          },
          gridLines: {
            display: false,
          }
        }],
        yAxes: [{
          ticks: {
            fontFamily: "'Roboto Mono'",
          }
        }]
      },
    }
  }

  if (!chart) {
    chart = new Chart(ctx, options);
  } else {
    chart.data.labels = options.data.labels;
    chart.data.datasets = options.data.datasets;
    chart.update();
  }
}

function updatePlaceholder(content, className = 'text-secondary') {
  const placeholder = document.getElementById('placeholder');
  placeholder.className = className;
  placeholder.innerHTML = content;
}

function extractHourFromCommits(commits) {
  let hours = [0, 0, 0, 0, 0, 0, 
    0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 
    0, 0, 0, 0, 0, 0];
  let i;
  for (i = 0; i < commits.length; i++) {  
    hours[new Date(commits[i].date).getHours()] += 1;
  }
  return hours;
}

function handleSearch(username, repo) {
  updatePlaceholder('Loading...');

  return Promise.all([
    getCommitsHour(username, repo)
  ])
    .then(([commits]) => {
      updatePlaceholder('');

      const data = extractHourFromCommits(commits);
      const labels = [0, 1, 2, 3, 4, 5,
                      6, 7, 8, 9, 10, 11,
                      12, 13, 14, 15, 16, 17,
                      17, 18, 19, 20, 21, 22, 23]
      const backgroundColor = '#000';
      updateChart({ labels, data, backgroundColor });
    })
    .catch(err => {
      updatePlaceholder('No result found...', 'text-error');
      console.error('Cannot fetch data', err)
    });
}

searchForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const repoUsername = this.elements['repo-username'].value;
  if (!repoUsername) {
    return;
  }
  const atPosition = repoUsername.search('@');
  const repo = repoUsername.substring(0, atPosition);
  const username = repoUsername.substring(atPosition + 1);
  handleSearch(username, repo);
});
