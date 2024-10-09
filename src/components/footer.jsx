import { FaGithub } from 'react-icons/fa';
import { SiLeaflet } from 'react-icons/si';
import { FiExternalLink } from 'react-icons/fi';

function Footer() {
    return (
        <footer style={footerStyle}>
            <div style={linkSectionStyle}>
                <p>
                    Data sourced from{' '}
                    <a href="https://airlabs.co" target="_blank" rel="noopener noreferrer">
                        Airlabs.co <FiExternalLink />
                    </a>
                </p>
                <p>
                    Map powered by{' '}
                    <a href="https://leafletjs.com/" target="_blank" rel="noopener noreferrer">
                        Leaflet <SiLeaflet />
                    </a>
                </p>
                <p>
                    <a href="https://github.com/chris-dennis/nearby-planes" target="_blank" rel="noopener noreferrer">
                        GitHub <FaGithub />
                    </a>
                </p>
            </div>
            <div style={disclaimerStyle}>
                <p>Disclaimer: No data is collected.</p>
            </div>
        </footer>
    );
}

const footerStyle = {
    backgroundColor: 'rgba(0,0,0,0.27)',
    padding: '20px',
    textAlign: 'center',
    fontSize: '14px',
    color: 'white',
    width: '100%',
    bottom: 0,
    position: 'relative',

};

const linkSectionStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    flexWrap: 'wrap',
    marginBottom: '10px',
};

const disclaimerStyle = {
    marginTop: '10px',
    color: 'lightgray',
};

export default Footer;
