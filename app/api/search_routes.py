from flask import Blueprint, request
from ..models import User, db
from ..utils.api_utils import error_response
import logging

logger = logging.getLogger(__name__)

search_routes = Blueprint("query", __name__)


@search_routes.route('')
def query():
    query = request.args.get('query')
    
    # Handle missing query parameter
    if query is None:
        return error_response("Query parameter is required", 400)
    
    # Handle empty query - return empty results
    if query.strip() == "":
        return {"results": []}

    try:
        userResults = User.query.filter(User.username.ilike(f'%{query}%')).all()

        results = []
        
        for user in userResults:
            user_dict = user.to_dict()
            results.append(user_dict)

        return {"results": results}
    except Exception as e:
        logger.error(f"Database error in search: {e}")
        return error_response("Database error occurred", 500)


