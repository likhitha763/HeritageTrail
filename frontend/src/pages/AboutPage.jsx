import { Link } from 'react-router-dom';

const principles = [
  ['01', 'Choose your pace', 'Explore on foot, in a self-drive car, or using the tourist-bus option offered for a route.'],
  ['02', 'Listen to local memory', 'Places make more sense when you hear the people, traditions, and histories that shaped them.'],
  ['03', 'Make heritage more accessible', 'Travel options and clear stop information help more visitors plan a route that suits them.'],
];

const projectArchitecture = [
  ['01', 'A normalized relational model', 'Cities, Landmarks, Itineraries, Itinerary_Stops, TourModes, Itinerary_Modes, and Bookings separate the project’s core data.'],
  ['02', 'A route with order', 'Itinerary_Stops links tours to landmarks. Its StopOrder column preserves the exact sequence shown in the timeline.'],
  ['03', 'Travel options and capacity', 'Itinerary_Modes connects each route to its available options and stores capacity per option: people/seats for walking and buses, vehicle slots for self-drive cars.'],
  ['04', 'Rules enforced in MySQL', 'The stored procedure returns active stops in order. Triggers prevent duplicate landmarks and enforce the capacity unit for the selected tour option.'],
];

export default function AboutPage() {
  return (
    <main className="page-content about-page">
      <section className="page-intro">
        <p className="eyebrow">THE IDEA · THE DATABASE</p>
        <h1>Curiosity is a<br />good travel plan.</h1>
        <p>HeritageTrails helps visitors plan heritage tours in a way that suits them, whether they prefer walking, a self-drive car route, or a tourist-bus option.</p>
      </section>

      <section className="about-feature">
        <div className="about-art">
          <img src="/images/sultan-battery.jpg" alt="Historic Sultan Battery overlooking the coast in Mangaluru" loading="lazy" />
          <span>LOCAL<br />STORIES<br />LIVE HERE.</span>
        </div>
        <div className="about-copy">
          <p className="eyebrow">ROOTED IN MANGALURU</p>
          <h2>A coastal city, told from the ground up.</h2>
          <p>Mangaluru carries many histories at once: port and pilgrimage, languages and trade, old neighbourhoods and everyday rituals. Our tours connect these layers through the landmarks and streets that hold them.</p>
          <p>Each route lists its stops and travel options so visitors can choose how they want to explore the city.</p>
        </div>
      </section>

      <section className="project-architecture" aria-labelledby="architecture-title">
        <div className="architecture-heading">
          <p className="eyebrow">DBMS PROJECT · VIVA OVERVIEW</p>
          <h2 id="architecture-title">The thinking behind the route.</h2>
          <p>Each tour is powered by a relational design that stores route order, travel options, and capacity rules clearly.</p>
        </div>
        <div className="architecture-grid">
          {projectArchitecture.map(([number, title, description]) => (
            <article className="architecture-card" key={number}>
              <span className="architecture-number">{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="principles">
        <p className="eyebrow">HOW WE LIKE TO TRAVEL</p>
        <div className="principle-list">
          {principles.map(([number, title, description]) => (
            <article className="principle" key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="about-cta">
        <p className="eyebrow eyebrow-light">READY TO STEP OUT?</p>
        <h2>Find the tour that feels like yours.</h2>
        <Link className="button button-paper" to="/tours">Explore the tours <span aria-hidden="true">↗</span></Link>
      </section>
    </main>
  );
}
