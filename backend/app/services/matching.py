# backend/app/services/matching.py
from sqlalchemy.orm import Session
from app.models.demand import Demand
from app.models.offer import Offer
from app.models.product import Product
from app.models.match import Match, MatchStatus
from app.services.notification import notify_user
from typing import List


def calculate_match_score(offer: Offer, demand: Demand):
    """
    Calculates a match score between 0 and 100
    and returns a descriptive reason.
    Returns (score, reason, is_valid)
    """
    price_score = 100.0
    location_score = 0.0
    quantity_score = 0.0
    quality_score = 100.0

    reasons = []

    # 1. Price (40%)
    if demand.max_unit_price:
        if offer.unit_price <= demand.max_unit_price:
            price_score = 100.0
            reasons.append("Prix idéal")
        else:
            penalty = (
                (offer.unit_price - demand.max_unit_price) /
                demand.max_unit_price
            )
            if penalty > 0.3:  # More than 30% over budget
                return 0, "Prix trop élevé", False
            price_score = 100.0 * (1 - (penalty / 0.3))
            reasons.append("Prix légèrement au-dessus du budget")
    else:
        reasons.append("Prix non spécifié")

    # 2. Location (30%)
    if offer.location_region == demand.collector.location_region:
        location_score = 100.0
        reasons.append("Même région")
    else:
        location_score = 0.0
        reasons.append("Région différente")

    # 3. Quantity (20%)
    if offer.quantity >= demand.quantity:
        quantity_score = 100.0
        reasons.append("Quantité suffisante")
    else:
        quantity_score = 100.0 * (offer.quantity / demand.quantity)
        reasons.append("Quantité partielle")

    # 4. Quality (10%)
    if demand.quality_required:
        if offer.quality == demand.quality_required:
            quality_score = 100.0
            reasons.append("Qualité correspondante")
        else:
            quality_score = 0.0
            reasons.append("Qualité différente")
    else:
        reasons.append("Qualité non spécifiée")

    total_score = (
        (0.4 * price_score) +
        (0.3 * location_score) +
        (0.2 * quantity_score) +
        (0.1 * quality_score)
    )

    # Filter out very low scores
    if total_score < 30:
        return total_score, "Score trop faible", False

    return total_score, " | ".join(reasons), True

def find_matches_for_demand(db: Session, demand: Demand) -> List[Match]:
    """
    Finds matching offers for a newly created demand.
    """
    matches = []
    # 1. Identify the product to match against
    target_product_id = demand.product_id
    target_product_name = demand.product_name

    query = db.query(Offer).filter(Offer.status == "active")

    if target_product_id:
        # Direct match by product ID
        query = query.filter(Offer.product_id == target_product_id)
    elif target_product_name:
        # Match by product name
        query = query.join(Product).filter(
            Product.name.ilike(f"%{target_product_name}%")
        )
    else:
        return []

    potential_offers = query.all()
    notified_farmers = set()

    for offer in potential_offers:
        score, reason, is_valid = calculate_match_score(offer, demand)
        if not is_valid:
            continue

        # Create Match record
        match = Match(
            offer_id=offer.id,
            demand_id=demand.id,
            match_score=score,
            matching_reason=reason,
            status=MatchStatus.PENDING
        )
        db.add(match)
        matches.append(match)
        
        # Notify Farmer (only once per matching session)
        if offer.farmer_id not in notified_farmers:
            notify_user(
                db,
                offer.farmer,
                f"Nouvelle demande trouvée pour votre offre de {offer.product.name}!",
                "info"
            )
            notified_farmers.add(offer.farmer_id)
    
    # Notify Collector if matches found
    if matches:
        notify_user(
            db,
            demand.collector,
            f"Trouvé {len(matches)} offre(s) correspondant à votre demande!",
            "success"
        )
    
    db.commit()
    return matches


def find_matches_for_offer(db: Session, offer: Offer) -> List[Match]:
    """
    Finds matching demands for a newly created offer.
    """
    matches = []
    query = db.query(Demand).filter(Demand.status == "active")
    product_name = offer.product.name
    from sqlalchemy import or_

    query = query.filter(
        or_(
            Demand.product_id == offer.product_id,
            Demand.product_name.ilike(f"%{product_name}%")
        )
    )
    potential_demands = query.all()
    notified_collectors = set()

    for demand in potential_demands:
        score, reason, is_valid = calculate_match_score(offer, demand)
        if not is_valid:
            continue

        # Create Match record
        match = Match(
            offer_id=offer.id,
            demand_id=demand.id,
            match_score=score,
            matching_reason=reason,
            status=MatchStatus.PENDING
        )
        db.add(match)
        matches.append(match)

        # Notify Collector (only once per matching session)
        if demand.collector_id not in notified_collectors:
            notify_user(
                db,
                demand.collector,
                "Nouvelle offre trouvée pour votre demande!",
                "info"
            )
            notified_collectors.add(demand.collector_id)
            
    # Notify Farmer if matches found
    if matches:
        notify_user(
            db,
            offer.farmer,
            f"Trouvé {len(matches)} demande(s) correspondant à votre offre!",
            "success"
        )
    
    db.commit()
    return matches
