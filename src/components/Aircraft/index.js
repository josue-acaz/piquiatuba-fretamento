import React from "react";
import { Row, Col } from "react-bootstrap";
import { MinutesToHoursNotation } from "../../utils";

import './styles.css';

export default function Aircraft({ aircraft={}, flight_time=0 }) {

    return(
        <div className="render-aircraft">
            <Row className="center-padding">
                <Col className="thumbnail" sm="4">
                    <img src={aircraft.thumbnail} alt="aircraft thumbnail" />
                </Col>
                <Col className="ardetails" sm="8">
                    <div className="head">
                        <p className="name">{aircraft.name}</p>
                        <p className="prefix">{aircraft.prefix}</p>
                    </div>
                    <p>Velocidade: {aircraft.maximum_speed+" Km/h"}</p>
                    <p>Passageiros: {aircraft.passengers}</p>
                    <p><strong>Tempo de voo: </strong>{MinutesToHoursNotation(flight_time)}</p>
                </Col>
            </Row>
        </div>
    );
}