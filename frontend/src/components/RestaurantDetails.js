import React, { useEffect, useState, useContext } from 'react'
import { useParams, useHistory, Link } from 'react-router-dom'
import axios from 'axios'
import RestaurantReview from './RestaurantReview'
import NewRatingInput from './NewRatingInput'
import AppContext from '../AppContext'

function RestaurantDetails(props) {
  const [isLoading, setIsLoading] = useState(true)
  const [restaurant, setRestaurant] = useState()
  const [ratings, setRatings] = useState([])
  const [ratingsCollection, setRatingsCollection] = useState([])
  const [counter, setCounter] = useState(5)
  const [isMoreRatings, setIsMoreRatings] = useState(true)
  const [scrollPosition, setScrollPosition] = useState(0)

  const history = useHistory()
  const { id } = useParams()
  const dispatch = useContext(AppContext)

  useEffect(() => {
    async function fetchRestaurantData() {
      try {
        const response = await axios.get(`/restaurants/${id}`)
        setRestaurant(response.data)
        fetchRestaurantReviews()
      } catch (err) {
        dispatch({ type: 'FlashMessage', value: 'A restaurant with that id does not exist', color: 'error' })
        history.push('/')
      }
    }
    async function fetchRestaurantReviews() {
      try {
        const response = await axios.get(`/ratings/${id}`)
        setRatingsCollection(response.data)
        setRatings(response.data.slice(0, counter))
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
        await axios.delete(`/restaurants/${id}`)
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
    if (ratingsCollection.length && counter >= ratingsCollection.length) {
      setIsMoreRatings(false)
    }
  }, [counter])

  // Restores current page position after loading new ratings
  useEffect(() => {
    window.scrollTo(0, scrollPosition)
  }, [ratings])

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <>
      <h1>{restaurant.name}</h1>
      <div>
        {ratings.map(review => {
          return <RestaurantReview key={review.id} review={review} setRatings={setRatings} ratings={ratings} setRestaurant={setRestaurant} restaurant={restaurant} />
        })}
      </div>
      {isMoreRatings && <button onClick={() => setCounter(prev => prev + 5)}>Load More Ratings</button>}
      <br />
      <h3>Page Details</h3>
      <div>name: {restaurant.name}</div>
      <div>description: {restaurant.description}</div>
      <div>location: {restaurant.location}</div>
      <div>pricerange: {restaurant.pricerange}</div>
      <div>rating: {restaurant.rating}</div>
      <div>count: {restaurant.count}</div>
      <Link to={`/restaurant/${restaurant.id}/update`}>Edit Restaurant</Link>
      <button onClick={() => handleDelete(restaurant.id)}>Delete Restaurant</button>
      <br />
      <br />
      <br />
      <NewRatingInput id={id} setRatings={setRatings} ratings={ratings} setRestaurant={setRestaurant} restaurant={restaurant} />
    </>
  )
}

export default RestaurantDetails
