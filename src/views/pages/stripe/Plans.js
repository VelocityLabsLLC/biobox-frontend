import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import * as _ from 'lodash';
import { useStripe } from '@stripe/react-stripe-js';
import {
  getPlans,
  getCheckoutSession,
  updateUser,
} from '../../../services/AppService';
import { useHistory } from 'react-router-dom';
import { Loader } from 'src/reusable';

const Plans = () => {
  // const stripe = useStripe();
  // const [bioBoxPlans, setBioBoxPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [bioBoxPlans, setBioBoxPlans] = useState([
    {
      name: 'Free Plan',
      description: '---',
      price: 0,
      space: 1,
      users: 1,
    },
  ]);
  const _history = useHistory();

  const updateSubscription = async (plan) => {
    setLoading(true);
    try {
      let data = JSON.parse(localStorage.getItem('userDetail'));
      let resp = await updateUser(data.id, { ...data, subscription: plan });
      if (resp) {
        _history.push('/');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // const getBioBoxPlans = async () => {
  //   try {
  //     const { data: { data: bioBoxPlansData } } = await getPlans()
  //     setBioBoxPlans(bioBoxPlansData)
  //   } catch (error) {
  //     toast.error("Something went wrong please Try again later");
  //     console.log(error);
  //   }
  // }

  // const handleCreateCheckoutSession = async (priceId) => {
  //   setLoading(true)
  //   const { data: { sessionId } } = await getCheckoutSession({ priceId })
  //   stripe.redirectToCheckout({
  //     sessionId
  //   })
  // }

  // useEffect(() => {
  //   getBioBoxPlans()
  // }, [])

  return (
    <>
      {loading && <Loader />}
      <div className="row justify-content-center align-items-center text-center m-2">
        {bioBoxPlans?.map((plan) => {
          return (
            <>
              <div className="col-4 border border-secondary p-5 m-3">
                <h3 className="text-capitalize mb-4">{_.get(plan, 'name')}</h3>
                {/* <h2 className="mb-4">
                  <sup className="text-uppercase">
                    {_.get(plan, 'plans[0].currency')}
                  </sup>
                  <span className="mx-2">
                    {(_.get(plan, 'plans[0].amount') / 100).toFixed(2)}
                  </span>
                  <small className="text-lowercase">
                    {`/${
                      _.get(plan, 'plans[0].interval_count') === 1
                        ? ''
                        : _.get(plan, 'plans[0].interval_count')
                    }${_.get(plan, 'plans[0].interval')}`}
                  </small>
                </h2> */}

                {/* TEMPORARY DATA*/}
                <div className="mb-4">
                  <h5 className="mx-2">Price: ${_.get(plan, 'price')}</h5>
                  <h5 className="mx-2">Space: {_.get(plan, 'space')} GB</h5>
                  <h5 className="mx-2">No of Users: {_.get(plan, 'users')}</h5>
                </div>
                {/* END */}

                {/* <div className="mb-4">
                  <p>{_.get(plan, 'description', '')}</p>
                </div> */}
                <div>
                  <button
                    type="button"
                    disabled={loading || process.env.REACT_APP_ENV !== 'CLOUD'}
                    onClick={() => {
                      // handleCreateCheckoutSession(_.get(plan, 'plans[0].id'));
                      updateSubscription(plan.name);
                    }}
                    className="btn btn-primary btn-lg btn-block"
                  >
                    {process.env.REACT_APP_ENV === 'CLOUD' ? (
                      <>Subscribe</>
                    ) : (
                      <>-----</>
                    )}
                  </button>
                </div>
              </div>
            </>
          );
        })}
      </div>
    </>
  );
};

export default Plans;
