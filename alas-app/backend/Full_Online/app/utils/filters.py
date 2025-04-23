import django_filters
from ..models import Product, BrandType


class ProductFilter(django_filters.FilterSet):
    brand = django_filters.ModelChoiceFilter(
        queryset=BrandType.objects.all(), field_name="brand"
    )
    min_price = django_filters.NumberFilter(field_name="price", lookup_expr="gte")
    max_price = django_filters.NumberFilter(field_name="price", lookup_expr="lte")
    has_stock = django_filters.BooleanFilter(method="filter_by_stock")

    class Meta:
        model = Product
        fields = ["brand", "price"]

    def filter_by_stock(self, queryset, name, value):
        if value:
            return queryset.filter(stock__gt=0)
        return queryset.filter(stock__lte=0)
