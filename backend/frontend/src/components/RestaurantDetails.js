import React, { useEffect, useState, useContext } from 'react'
import { useParams, useHistory, Link } from 'react-router-dom'
import axios from 'axios'
import RestaurantReview from './RestaurantReview'
import NewRatingInput from './NewRatingInput'
import AppContext from '../AppContext'
import StateContext from '../StateContext'
import StarRating from './StarRating'
import RestaurantMap from './RestaurantMap'

function RestaurantDetails(props) {
  const [isLoading, setIsLoading] = useState(true)
  const [restaurant, setRestaurant] = useState()
  const [ratings, setRatings] = useState([])
  const [ratingsCollection, setRatingsCollection] = useState([])
  const [counter, setCounter] = useState(5)
  const [isMoreRatings, setIsMoreRatings] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)
  const [loadEvent, setLoadEvent] = useState(0)

  const history = useHistory()
  const { id } = useParams()
  const dispatch = useContext(AppContext)
  const state = useContext(StateContext)

  useEffect(() => {
    async function fetchRestaurantData() {
      try {
        const response = await axios.get(`/api/restaurants/${id}`)
        setRestaurant(response.data)
        fetchRestaurantReviews()
      } catch (err) {
        dispatch({ type: 'FlashMessage', value: 'A restaurant with that id does not exist', color: 'error' })
        history.push('/')
      }
    }
    async function fetchRestaurantReviews() {
      try {
        const response = await axios.get(`/api/ratings/${id}`)
        setRatingsCollection(response.data)
        setRatings(response.data.slice(0, counter))
        if (response.data.length > 5) setIsMoreRatings(true)
        setIsLoading(false)
      } catch (err) {
        dispatch({ type: 'FlashMessage', value: err.response.data, color: 'error' })
      }
    }
    fetchRestaurantData()
  }, [id])

  // Handle Delete Button Click
  async function handleDelete(id) {
    const confirm = window.confirm('Are you sure you want to delete this restaurant?')
    if (confirm) {
      try {
        await axios.delete(`/api/restaurants/${id}`)
        dispatch({ type: 'FlashMessage', value: 'Restaurant was successfully deleted!', color: 'success' })
        history.push('/')
      } catch (err) {
        dispatch({ type: 'FlashMessage', value: err.response.data, color: 'error' })
      }
    }
  }

  // Handle Load More Button
  useEffect(() => {
    setScrollPosition(window.scrollY)
    setRatings(ratingsCollection.slice(0, counter))
    setLoadEvent(prev => prev + 1)
    if (ratingsCollection.length && counter >= ratingsCollection.length) {
      setIsMoreRatings(false)
    }
  }, [counter])

  // Restores current page position after loading new ratings
  useEffect(() => {
    window.scrollTo(0, scrollPosition)
  }, [loadEvent])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <h1>{restaurant.name}</h1>
      <RestaurantMap restaurant={restaurant} />
      <h3>Page Details</h3>
      <div>name: {restaurant.name}</div>
      <div>description: {restaurant.description}</div>
      <div>location: {restaurant.location}</div>
      <div>pricerange: {restaurant.pricerange}</div>
      {restaurant.rating > 0 ? <StarRating rating={restaurant.rating} count={restaurant.count} /> : 'No Ratings'}
      <div>rating: {restaurant.rating}</div>
      <div>count: {restaurant.count}</div>
      {state.loggedIn && (
        <>
          <Link to={`/restaurant/${restaurant.id}/update`}>Edit Restaurant</Link>
          <button onClick={() => handleDelete(restaurant.id)}>Delete Restaurant</button>
        </>
      )}
      <br />
      <NewRatingInput id={id} setRatings={setRatings} ratings={ratings} setRestaurant={setRestaurant} restaurant={restaurant} setRatingsCollection={setRatingsCollection} />
      <br />
      <br />
      <div>
        {ratings.map(review => {
          return <RestaurantReview key={review.id} review={review} setRatings={setRatings} ratings={ratings} setRestaurant={setRestaurant} restaurant={restaurant} setRatingsCollection={setRatingsCollection} />
        })}
      </div>
      {isMoreRatings && <button onClick={() => setCounter(prev => prev + 5)}>Load More Ratings</button>}
    </>
  )
}

export default RestaurantDetails