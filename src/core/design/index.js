import styled from 'styled-components';

const FlexContent = styled.div`
    display: flex;
    align-items: center;
`;

const FlexSpaceBetween = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
`;

const WrapperContent = styled.div`
    padding: 1rem;
    background-color: ${props => props.color ? props.color : '#ffffff'};
    width: 100%;
    height: auto;
`;

const FlexVerticalSpaceBetween = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    width: 100%;
`;

const SegmentCard = styled.div`
    background-color: #ffffff;
    padding: 1rem;
    border-radius: .5rem;
    margin-bottom: 1rem;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1), 0 6px 20px 0 rgba(0, 0, 0, 0.05);
    transition: 0.2s;
`;

const Card = styled.div`
    background-color: #ffffff;
    padding: 1rem;
    border-radius: .5rem;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1), 0 6px 20px 0 rgba(0, 0, 0, 0.05);
`;

export {
    Card,
    WrapperContent, 
    FlexContent,
    FlexSpaceBetween,
    FlexVerticalSpaceBetween,
    SegmentCard,
};
