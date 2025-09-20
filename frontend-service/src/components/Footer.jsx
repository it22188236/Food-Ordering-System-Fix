import React from "react";
import teamLogo from "../assets/team_logo.png";
import facebook from "../assets/social-icons/facebook_logo.png";
import instagram from "../assets/social-icons/instagram_logo.png";
import whatsapp from "../assets/social-icons/whatsapp_logo.png";
import x from "../assets/social-icons/x_logo.png";
import "../styles/Footer.css";
import { Link } from "react-router-dom";

const Footer = () => {


  return (
    <div>
      <div className="footer-container">
        <div className="footer-ul">
          <ul>
            <div className="footer-li">
              <li>
                <img src={teamLogo} alt="team_logo.png" />
              </li>

              <li>
                About
                <div className="footer-about-ul">
                  <ul>
                    <div className="footer-about-li">
                      <li>About us</li>
                      <li>Contact us</li>
                    </div>
                  </ul>
                </div>
              </li>

              <li>
                Work with Us
                <div className="footer-work-ul">
                  <ul>
                    <div className="footer-work-li">
                      <li><Link to={'/delivery-register'} className="footer-Link">Join as Delivery</Link></li>
                      <li><Link to={'/restaurant-register'} className="footer-Link ">Join as Restaurant</Link></li>
                    </div>
                  </ul>
                </div>
              </li>

              <li>
                Policy
                <div className="footer-policy-ul">
                  <ul>
                    <div className="footer-policy-li">
                      <li>Teams and Conditions</li>
                      <li>Privacy Policy</li>
                    </div>
                  </ul>
                </div>
              </li>

              <li>
                Connect with Us
                <div className="footer-connect-ul">
                  <ul>
                    <div className="footer-connect-li">
                      <li>
                        <a href={'https://www.facebook.com/'} target="_blank">
                          <img src={facebook} alt="facebook logo" />
                        </a>
                      </li>
                      <li>
                        <a href={"https://www.instagram.com/"} target="_blank">
                          <img src={instagram} alt="instagram logo" />
                        </a>
                      </li>
                      <li>
                        <a href={"https://www.whatsapp.com/"} target="_blank">
                          <img src={whatsapp} alt="whatsapp logo" />
                        </a>
                      </li>
                      <li>
                        <a href={"https://x.com/"} target="_blank">
                          <img src={x} alt="x logo" />
                        </a>
                      </li>
                    </div>
                  </ul>
                </div>
              </li>
            </div>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Footer;
