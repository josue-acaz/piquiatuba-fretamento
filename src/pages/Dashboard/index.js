import React from 'react';
import { PageTitle } from '../../components';
import { WrapperContent } from '../../core/design';

import './styles.css';

export default function Dashboard() {

    return(
        <WrapperContent>
            <section id="dashboard" className="dashboard">
                <PageTitle title="Dashboard" subtitle="verificar cotações" />
            </section>
        </WrapperContent>
    )
}