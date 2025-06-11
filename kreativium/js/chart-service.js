import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

let triggersChartInstance = null;
let moodsChartInstance = null;

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        y: { 
            beginAtZero: true,
            ticks: { color: '#9ca3af', stepSize: 1 },
            grid: { color: 'rgba(255,255,255,0.1)' }
        },
        x: { 
            ticks: { color: '#9ca3af' },
            grid: { display: false }
        }
    },
    plugins: { legend: { display: false } }
};

const renderPlaceholder = (ctx) => {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'center';
    ctx.fillText('Log data to see your charts.', ctx.canvas.width / 2, ctx.canvas.height / 2);
};

export const renderCharts = (events) => {
    const triggersCtx = document.getElementById('triggers-chart')?.getContext('2d');
    const moodsCtx = document.getElementById('moods-chart')?.getContext('2d');

    if (!triggersCtx || !moodsCtx) return;

    // Destroy previous instances
    if (triggersChartInstance) triggersChartInstance.destroy();
    if (moodsChartInstance) moodsChartInstance.destroy();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // recentEvents should already have JS Date objects in e.timestamp
    const recentEvents = events.filter(e => {
        if (!(e.timestamp instanceof Date) || isNaN(e.timestamp.getTime())) {
            console.warn("[chart-service/renderCharts] Invalid or missing timestamp for event:", e.id, e.timestamp);
            return false; // Skip this event if timestamp is not a valid JS Date
        }
        return e.timestamp.getTime() > thirtyDaysAgo.getTime(); // Compare using getTime()
    });

    // Process Trigger Data
    const triggerCounts = recentEvents.flatMap(e => e.triggers).reduce((acc, trigger) => {
        acc[trigger] = (acc[trigger] || 0) + 1;
        return acc;
    }, {});

    if (Object.keys(triggerCounts).length > 0) {
        triggersChartInstance = new Chart(triggersCtx, {
            type: 'bar',
            data: { 
                labels: Object.keys(triggerCounts),
                datasets: [{ label: 'Frequency', data: Object.values(triggerCounts), backgroundColor: 'rgba(251, 146, 60, 0.3)', borderColor: '#fb923c', borderWidth: 1 }] 
            },
            options: chartOptions
        });
    } else {
        renderPlaceholder(triggersCtx);
    }

    // Process Mood Data
    const moodCounts = recentEvents.reduce((acc, event) => {
        acc[event.mood] = (acc[event.mood] || 0) + 1;
        return acc;
    }, {});

    if (Object.keys(moodCounts).length > 0) {
        moodsChartInstance = new Chart(moodsCtx, {
            type: 'pie',
            data: { 
                labels: Object.keys(moodCounts),
                datasets: [{ data: Object.values(moodCounts), backgroundColor: ['#a78bfa', '#f472b6', '#fb923c', '#34d399', '#60a5fa'], borderWidth: 0 }] 
            },
            options: { ...chartOptions, plugins: { legend: { position: 'top', labels: { color: '#9ca3af' } } } }
        });
    } else {
        renderPlaceholder(moodsCtx);
    }
};

export function setupCharts() {
    // Chart.js initialization code will go here
    // console.log("chart-service.js: setupCharts function called");
}

// Set global chart defaults
Chart.defaults.color = '#e0e0e0';
Chart.defaults.borderColor = 'rgba(224, 224, 224, 0.2)';

export function renderDashboardCharts(experiences, SENSORY_TRIGGERS) {
    // Triggers Chart (Potential Overstimulation Factors)
    const triggerCounts = {};
    experiences.forEach(exp => {
        exp.triggers?.forEach(triggerId => {
            const triggerLabel = SENSORY_TRIGGERS[triggerId]?.label || triggerId;
            triggerCounts[triggerLabel] = (triggerCounts[triggerLabel] || 0) + 1;
        });
    });

    const triggersChartCtx = document.getElementById('triggers-chart')?.getContext('2d');
    if (triggersChartCtx) {
        if (window.triggersChartInstance) {
            window.triggersChartInstance.destroy();
            window.triggersChartInstance = null;
        }
        window.triggersChartInstance = new Chart(triggersChartCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(triggerCounts),
                datasets: [{
                    label: 'Frequency',
                    data: Object.values(triggerCounts),
                    backgroundColor: 'rgba(249, 115, 22, 0.6)', // orange-500 with alpha
                    borderColor: 'rgba(249, 115, 22, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true, 
                maintainAspectRatio: false,
                scales: { 
                    y: { 
                        beginAtZero: true, 
                        ticks: { color: '#a0a0a0' }, 
                        grid: { color: 'rgba(224, 224, 224, 0.1)'} 
                    },
                    x: { 
                        ticks: { color: '#a0a0a0' }, 
                        grid: { color: 'rgba(224, 224, 224, 0.1)'} 
                    } 
                },
                plugins: { 
                    legend: { display: false }, 
                    title: { display: false } 
                }
            }
        });
    }

    // Moods Chart (Well-being & Energy Flow - simplified to mood for now)
    const moodValuesOverTime = experiences
        .filter(exp => exp.timestamp && exp.mood) // Ensure timestamp and mood exist
        .map(exp => {
            // exp.timestamp should already be a JS Date object from data-manager.js
            // Directly use it, but validate it's a Date object.
            if (!(exp.timestamp instanceof Date) || isNaN(exp.timestamp.getTime())) {
                console.warn("Invalid or missing timestamp for experience:", exp.id, exp.timestamp);
                return null; // Skip this data point
            }
            return {
                x: exp.timestamp, // Use the JS Date object directly
                y: exp.mood
            };
        })
        .filter(Boolean) // Remove any nulls from invalid timestamps
        .sort((a,b) => a.x.getTime() - b.x.getTime()); // Sort by date using getTime()

    const moodsChartCtx = document.getElementById('moods-chart')?.getContext('2d');
    if (moodsChartCtx) {
        if (window.moodsChartInstance) {
            window.moodsChartInstance.destroy();
            window.moodsChartInstance = null;
        }
        window.moodsChartInstance = new Chart(moodsChartCtx, {
            type: 'line',
            data: {
                datasets: [{
                    label: 'Mood Level (1-5)',
                    data: moodValuesOverTime,
                    borderColor: 'rgba(20, 184, 166, 1)', // teal-500
                    backgroundColor: 'rgba(20, 184, 166, 0.3)',
                    fill: true,
                    tension: 0.2
                }]
            },
            options: {
                responsive: true, 
                maintainAspectRatio: false,
                scales: {
                    x: { 
                        type: 'time', 
                        time: { unit: 'day' }, 
                        ticks: { color: '#a0a0a0' }, 
                        grid: { color: 'rgba(224, 224, 224, 0.1)'} 
                    },
                    y: { 
                        beginAtZero: false, 
                        min: 1, 
                        max: 5, 
                        ticks: { color: '#a0a0a0', stepSize: 1 }, 
                        grid: { color: 'rgba(224, 224, 224, 0.1)'} 
                    }
                },
                plugins: { 
                    legend: { display: false }, 
                    title: { display: false } 
                }
            }
        });
    }
} 