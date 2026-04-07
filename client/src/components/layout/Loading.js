import React from 'react';
import coffeeGif from '../../assets/coffee.gif';

const Loading = ({ text = "Brewing something special..." }) => {
  return (
    <div className="loading-container">
      <img src={coffeeGif} alt="Loading..." className="loading-gif" />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
};

export default Loading;
