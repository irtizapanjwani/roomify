import Featured from "../../components/featured/Featured";
import Footer from "../../components/footer/Footer";
import Header from "../../components/header/Header";
import MailList from "../../components/mailList/MailList";
import Navbar from "../../components/navbar/Navbar";
import PropertyList from "../../components/propertyList/PropertyList";
import AllHotels from "../../components/allHotels/AllHotels";
import "./home.css";

const Home = () => {
  console.log('this is the home page')
  return (
    <div>
      <Navbar />
      <Header/>
      <div className="homeContainer">
        <Featured/>
        <h1 className="homeTitle">Browse by property type</h1>
        <PropertyList/>
        <h1 className="homeTitle">All Available Hotels</h1>
        <AllHotels />
        <MailList/>
        <Footer/>
      </div>
    </div>
  );
};

export default Home;
